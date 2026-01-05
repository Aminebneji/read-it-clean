// services/claude.service.ts
import Anthropic from "@anthropic-ai/sdk";
import { CLAUDE_CONFIG } from "@/config/app.config";
import { logger } from "@/utils/logger.utils";
import { AppError } from "@/utils/error.utils";
import { ERROR_MESSAGES } from "@/config/constants";
import { getArticleById, updateArticleWithGeneratedText } from "./article.service";

function getAnthropicClient(): Anthropic {
    if (!CLAUDE_CONFIG.apiKey || CLAUDE_CONFIG.apiKey.trim() === '') {
        throw new AppError(
            `${ERROR_MESSAGES.MISSING_ENV_VAR}: ANTHROPIC_API_KEY`,
            'MISSING_API_KEY'
        );
    }

    return new Anthropic({
        apiKey: CLAUDE_CONFIG.apiKey
    });
}

function buildPrompt(title: string, description: string, link: string, context: string): string {
    return `${context}
Titre de l'article: ${title}
Lien de l'article: ${link}
Description: ${description}`;
}

// Génère du texte pour un article stocké en DB
export async function generateTextForArticle(
    articleId: string,
    customContext?: string
): Promise<string> {
    try {
        // Récupérer l'article depuis la DB
        const article = await getArticleById(articleId);

        // Vérifier si le texte n'a pas déjà été généré
        if (article.isGenerated && article.generatedText) {
            logger.info(`Article already has generated text: ${article.title}`);
            return article.generatedText;
        }

        logger.info(`Generating text for article: ${article.title}`);

        const context = customContext || CLAUDE_CONFIG.context;
        const prompt = buildPrompt(article.title, article.description || '', article.link, context);

        const anthropic = getAnthropicClient();
        const message = await anthropic.messages.create({
            model: CLAUDE_CONFIG.model,
            max_tokens: CLAUDE_CONFIG.maxTokens,
            messages: [
                {
                    role: "user",
                    content: prompt,
                },
            ],
        });

        const generatedText =
            message.content[0].type === "text"
                ? message.content[0].text
                : "";

        // Sauvegarder le texte généré en DB
        await updateArticleWithGeneratedText(articleId, generatedText);

        logger.success(`Generated and saved text for article: ${article.title}`);

        return generatedText;
    } catch (error) {
        logger.error(`Claude API error for article ${articleId}:`, error);
        throw new AppError(
            `${ERROR_MESSAGES.CLAUDE_API_FAILED}: ${(error as Error).message}`,
            'CLAUDE_API_ERROR'
        );
    }
}