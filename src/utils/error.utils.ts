export const ERROR_CODES = {
    // Erreurs API
    API_REQUEST_FAILED: 'API_REQUEST_FAILED',
    API_RESPONSE_INVALID: 'API_RESPONSE_INVALID',
    USAGE_LIMIT_REACHED: 'USAGE_LIMIT_REACHED',

    // Erreurs Claude
    CLAUDE_API_ERROR: 'CLAUDE_API_ERROR',
    MISSING_API_KEY: 'MISSING_API_KEY',

    // Erreurs RSS
    RSS_FETCH_FAILED: 'RSS_FETCH_FAILED',
    RSS_PARSE_FAILED: 'RSS_PARSE_FAILED',
    RSS_INVALID_URL: 'RSS_INVALID_URL',
    ARTICLE_NOT_FOUND: 'ARTICLE_NOT_FOUND',

    // Erreurs de validation
    VALIDATION_ERROR: 'VALIDATION_ERROR',
    MISSING_REQUIRED_FIELD: 'MISSING_REQUIRED_FIELD',

    // Erreurs réseau
    NETWORK_ERROR: 'NETWORK_ERROR',
    TIMEOUT_ERROR: 'TIMEOUT_ERROR',

    // Erreurs génériques
    UNKNOWN_ERROR: 'UNKNOWN_ERROR',
    INTERNAL_ERROR: 'INTERNAL_ERROR',
} as const;

export type ErrorCode = typeof ERROR_CODES[keyof typeof ERROR_CODES];


// Classe d'erreur personnalisée pour l'application

export class AppError extends Error {
    public readonly code: ErrorCode;
    public readonly timestamp: Date;
    public readonly context?: Record<string, unknown>;

    constructor(
        message: string,
        code: ErrorCode = ERROR_CODES.UNKNOWN_ERROR,
        context?: Record<string, unknown>
    ) {
        super(message);
        this.name = 'AppError';
        this.code = code;
        this.timestamp = new Date();
        this.context = context;

        // Maintient la stack trace correcte
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, AppError);
        }
    }
}

//Formate un message d'erreur de manière cohérente

export function formatErrorMessage(error: unknown, context?: string): string {
    const prefix = context ? `[${context}]` : '';

    if (error instanceof AppError) {
        return `${prefix} ${error.code}: ${error.message}`;
    }

    if (error instanceof Error) {
        return `${prefix} ${error.message}`;
    }

    if (typeof error === 'string') {
        return `${prefix} ${error}`;
    }

    return `${prefix} Une erreur inconnue s'est produite`;
}


//Vérifie si une erreur est une instance d'AppError

export function isAppError(error: unknown): error is AppError {
    return error instanceof AppError;
}

//Extrait le code d'erreur d'une erreur

export function getErrorCode(error: unknown): ErrorCode {
    if (isAppError(error)) {
        return error.code;
    }
    return ERROR_CODES.UNKNOWN_ERROR;
}


//erreur de validation

export function createValidationError(
    message: string,
    context?: Record<string, unknown>
): AppError {
    return new AppError(message, ERROR_CODES.VALIDATION_ERROR, context);
}


//erreur réseau

export function createNetworkError(
    message: string,
    context?: Record<string, unknown>
): AppError {
    return new AppError(message, ERROR_CODES.NETWORK_ERROR, context);
}
