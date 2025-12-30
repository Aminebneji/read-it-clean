import Anthropic from "@anthropic-ai/sdk";
import { ClaudeGenerationInput, ClaudeGenerationOutput } from "@/types/claude.types";
import { CLAUDE_CONFIG } from "@/config/app.config";
import { logger } from "@/utils/logger.utils";
import { AppError } from "@/utils/error.utils";
import { ERROR_MESSAGES } from "@/config/constants";


//Initialise le client Anthropic avec validation

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

// Construction du prompt pour Claude

function buildPrompt(input: ClaudeGenerationInput, context: string): string {
    return `${context}

Lien de l'article: ${input.link}
Description: ${input.description}

Génère un texte basé sur ces informations.`;
}


//Génère du texte à partir d'un lien et d'une description en utilisant l'API Claude

export async function generateTextWithClaude(
    input: ClaudeGenerationInput,
    customContext?: string
): Promise<ClaudeGenerationOutput> {
    const context = customContext || CLAUDE_CONFIG.context;
    const prompt = buildPrompt(input, context);

    try {
        logger.debug(`Generating text for: ${input.link}`);

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

        logger.success(`Generated text for: ${input.link}`);

        return {
            generatedText,
            originalLink: input.link,
            originalDescription: input.description,
        };
    } catch (error) {
        logger.error(`Claude API error for ${input.link}:`, error);
        throw new AppError(
            `${ERROR_MESSAGES.CLAUDE_API_FAILED}: ${(error as Error).message}`,
            'CLAUDE_API_ERROR'
        );
    }
}
