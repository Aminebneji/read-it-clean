// services/claude.service.ts
import Anthropic from "@anthropic-ai/sdk";
import { CLAUDE_CONFIG } from "@/config/app.config";
import { logger } from "@/utils/logger.utils";
import { AppError } from "@/utils/error.utils";
import { ERROR_MESSAGES } from "@/config/constants";
import { getArticleById, updateArticle } from "./article.service";

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

// Génère du texte pour un article stocké en DB
export async function generateTextForArticle(
    articleId: string,
    options?: {
        customContext?: string;
        force?: boolean;
    }
): Promise<article> {
    try {
        // Récupérer l'article depuis la DB
        const article = await getArticleById(articleId);

        // Vérifier si le texte n'a pas déjà été généré (sauf si force est vrai)
        if (!options?.force && article.isGenerated && article.generatedText) {
            logger.info(`Article already has generated text: ${article.title}`);
            return article as unknown as article;
        }

        logger.info(`${options?.force ? 'Re-generating' : 'Generating'} text for article: ${article.title}`);

        const context = options?.customContext || CLAUDE_CONFIG.context;
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

        const rawContent =
            message.content[0].type === "text"
                ? message.content[0].text
                : "";

        // parser le JSON
        let generatedData;
        try {
            // Nettoyage au cas où Claude ajouterait du texte autour (markdown etc)
            const jsonMatch = rawContent.match(/\{[\s\S]*\}/);
            const jsonString = jsonMatch ? jsonMatch[0] : rawContent;
            generatedData = JSON.parse(jsonString);
        } catch (_) {
            logger.error("Failed to parse Claude JSON response", rawContent);
            // Fallback si le format JSON n'est pas respecté
            generatedData = {
                title: article.title,
                description: article.description,
                content: rawContent
            };
        }

        // Sauvegarder les données générées en DB
        const updatedArticle = await updateArticle(articleId, {
            title: generatedData.title || article.title,
            description: generatedData.description || article.description,
            generatedText: generatedData.content || rawContent,
            isGenerated: true,
            generatedAt: new Date(),
        });

        logger.success(`Generated and saved all fields for article: ${updatedArticle.title}`);

        return updatedArticle as unknown as article;
    } catch (error) {
        logger.error(`Claude API error for article ${articleId}:`, error);
        throw new AppError(
            `${ERROR_MESSAGES.CLAUDE_API_FAILED}: ${(error as Error).message}`,
            'CLAUDE_API_ERROR'
        );
    }
}