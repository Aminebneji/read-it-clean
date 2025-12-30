// Messages d'erreur standardisés
export const ERROR_MESSAGES = {
    // Erreurs de configuration
    MISSING_ENV_VAR: 'Variable d\'environnement manquante',
    INVALID_CONFIG: 'Configuration invalide',

    // Erreurs Claude API
    CLAUDE_API_FAILED: 'Échec de l\'appel à l\'API Claude',
    CLAUDE_INVALID_RESPONSE: 'Réponse invalide de l\'API Claude',

    // Erreurs RSS
    RSS_FETCH_FAILED: 'Échec de la récupération du flux RSS',
    RSS_PARSE_FAILED: 'Échec du parsing du flux RSS',
    RSS_INVALID_URL: 'URL de flux RSS invalide',
    RSS_FEED_NOT_CONFIGURED: 'Flux RSS non configuré',

    // Erreurs génériques
    UNKNOWN_ERROR: 'Une erreur inconnue s\'est produite',
    INTERNAL_SERVER_ERROR: 'Erreur interne du serveur',
} as const;


//Messages de succès standardisés
export const SUCCESS_MESSAGES = {
    RSS_FETCHED: 'Flux RSS récupéré avec succès',
    ARTICLE_GENERATED: 'Article généré avec succès',
    ARTICLE_SAVED: 'Article sauvegardé avec succès',
} as const;

// Codes de statut HTTP
export const HTTP_STATUS = {
    OK: 200,
    CREATED: 201,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    INTERNAL_SERVER_ERROR: 500,
    SERVICE_UNAVAILABLE: 503,
} as const;
