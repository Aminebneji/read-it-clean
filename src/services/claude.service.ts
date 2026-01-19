// services/claude.service.ts
import Anthropic from "@anthropic-ai/sdk";
import { CLAUDE_CONFIG } from "@/config/app.config";
import { logger } from "@/utils/logger.utils";
import { AppError } from "@/utils/error.utils";
import { ERROR_MESSAGES } from "@/config/constants";
import { getArticleById, updateArticle } from "./article.service";
import { tracker } from "@/utils/security.utils";
import { article } from "@/types/article.types";

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

IMPORTANT: Ta réponse doit être un objet JSON valide uniquement.

Données de l'article source:
Titre: ${title}
Description: ${description}
Lien: ${link}`;
}

//Vérifie si la génération doit être ignorée ou non
function shouldSkipGeneration(article: { isGenerated: boolean; generatedText: string | null }, force?: boolean): boolean {
    return !force && article.isGenerated && !!article.generatedText;
}

//Parse la réponse JSON de Claude avec fallback
function parseClaudeResponse(rawContent: string, article: { title: string; description: string | null }) {
    try {
        const jsonMatch = rawContent.match(/\{[\s\S]*\}/);
        const jsonString = jsonMatch ? jsonMatch[0] : rawContent;
        return JSON.parse(jsonString);
    } catch {
        logger.error("Failed to parse Claude JSON response", rawContent);
        return {
            title: article.title,
            description: article.description,
            content: rawContent
        };
    }
}

// Génère du texte pour un article stocké en DB
export async function generateTextForArticle(
    articleId: string,
    options?: {
        customContext?: string;
        force?: boolean;
    }
): Promise<article> {
    try {

        const article = await getArticleById(articleId);


        if (shouldSkipGeneration(article, options?.force)) {
            logger.info(`Article already has generated text: ${article.title}`);
            return article as article;
        }

        logger.info(`${options?.force ? 'Re-generating' : 'Generating'} text for article: ${article.title}`);

        const context = options?.customContext || CLAUDE_CONFIG.context;
        const prompt = buildPrompt(article.title, article.description || '', article.link, context);

        // Check token usage limit before call
        if (!tracker.canUse()) {
            throw new AppError(
                "Claude API daily limit reached. Please try again tomorrow.",
                "USAGE_LIMIT_REACHED"
            );
        }

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

        // Record usage
        if (message.usage) {
            tracker.recordUsage(message.usage.input_tokens + message.usage.output_tokens);
        }

        const rawContent =
            message.content[0].type === "text"
                ? message.content[0].text
                : "";

        // Parser le JSON
        const generatedData = parseClaudeResponse(rawContent, article);

        // Sauvegarder les données générées en DB
        const updatedArticle = await updateArticle(articleId, {
            title: generatedData.title || article.title,
            description: generatedData.description || article.description,
            generatedText: generatedData.content || rawContent,
            isGenerated: true,
            generatedAt: new Date(),
        });

        logger.success(`Generated and saved all fields for article: ${updatedArticle.title}`);

        return updatedArticle as article;
    } catch (error) {
        logger.error(`Claude API error for article ${articleId}:`, error);
        const errorMessage = error instanceof Error ? error.message : "Erreur inconnue";
        throw new AppError(
            `${ERROR_MESSAGES.CLAUDE_API_FAILED}: ${errorMessage}`,
            'CLAUDE_API_ERROR'
        );
    }
}