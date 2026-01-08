import { AppError, ERROR_CODES } from '@/utils/error.utils';
import { ERROR_MESSAGES } from './constants';


// Récupère une variable d'environnement requise (lance une erreur si absente)
// En mode build, retourne une chaîne vide pour permettre la compilation
function getRequiredEnvVar(key: string): string {
    const value = process.env[key];

    // Pendant le build, on permet les valeurs vides
    if (process.env.NEXT_PHASE === 'phase-production-build') {
        return value || '';
    }

    if (!value || value.trim() === '') {
        throw new AppError(
            `${ERROR_MESSAGES.MISSING_ENV_VAR}: ${key}`,
            ERROR_CODES.MISSING_API_KEY
        );
    }

    return value;
}

// Récupère une variable d'environnement optionnelle avec valeur par défaut
function getOptionalEnvVar(key: string, defaultValue: string): string {
    const value = process.env[key];
    return (value && value.trim() !== '') ? value : defaultValue;
}


// Configuration de l'API Claude (Anthropic)

export const CLAUDE_CONFIG = {
    apiKey: getRequiredEnvVar('ANTHROPIC_API_KEY'),
    model: 'claude-sonnet-4-5-20250929', // Modèle par défaut (pas de variable d'env)
    maxTokens: parseInt(getOptionalEnvVar('CLAUDE_MAX_TOKENS', '2048'), 10),
    context: getOptionalEnvVar(
        'IA_API_CONTEXT',
        'Tu es un rédacteur passionné de World of Warcraft. Génère un article complet en français basé sur les données fournies. Réponds EXCLUSIVEMENT au format JSON avec la structure suivante : { "title": "titre accrocheur", "description": "résumé court", "content": "corps de l\'article complet" }'
    ),
    dailyTokenLimit: parseInt(getOptionalEnvVar('CLAUDE_DAILY_TOKEN_LIMIT', '100000'), 10),
} as const;


//Configuration des flux RSS ( refresh et adresse ) 
export const RSS_CONFIG = {
    feeds: {
        classic: getRequiredEnvVar('CLASSIC_RSS_FEED'),
        retail: getRequiredEnvVar('RETAIL_RSS_FEED'),
    },
    refreshIntervalMs: parseInt(getOptionalEnvVar('RSS_REFRESH_INTERVAL', '300000'), 10), // 5 minutes par défaut
} as const;


// Configuration de la base de données
export const DATABASE_CONFIG = {
    url: getOptionalEnvVar('DATABASE_URL', ''),
} as const;

// Configuration de l'environnement
// export const APP_CONFIG = {
//     nodeEnv: process.env.NODE_ENV || 'development',
//     isDevelopment: process.env.NODE_ENV === 'development',
//     isProduction: process.env.NODE_ENV === 'production',
// } as const;
