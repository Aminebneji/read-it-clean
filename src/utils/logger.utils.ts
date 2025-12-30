type LogLevel = 'debug' | 'info' | 'success' | 'warn' | 'error';

interface LogMetadata {
    [key: string]: unknown;
}


// Formate un message de log avec horodatage et niveau
function formatLogMessage(
    level: LogLevel,
    message: string,
    metadata?: LogMetadata
): string {
    const timestamp = new Date().toISOString();
    const levelUpper = level.toUpperCase().padEnd(7);
    const metadataStr = metadata ? ` ${JSON.stringify(metadata)}` : '';

    return `[${timestamp}] ${levelUpper} ${message}${metadataStr}`;
}


// Obtient la fonction console appropriée pour le niveau de log
function getConsoleMethod(level: LogLevel): (...args: unknown[]) => void {
    switch (level) {
        case 'error':
            return console.error;
        case 'warn':
            return console.warn;
        case 'debug':
            return console.debug;
        default:
            return console.log;
    }
}


//Logger structuré pour l'application

export const logger = {

    debug(message: string, metadata?: LogMetadata): void {
        if (process.env.NODE_ENV === 'development') {
            const consoleMethod = getConsoleMethod('debug');
            consoleMethod(formatLogMessage('debug', message, metadata));
        }
    },

    info(message: string, metadata?: LogMetadata): void {
        const consoleMethod = getConsoleMethod('info');
        consoleMethod(formatLogMessage('info', message, metadata));
    },

    success(message: string, metadata?: LogMetadata): void {
        const consoleMethod = getConsoleMethod('info');
        consoleMethod(formatLogMessage('success', message, metadata));
    },

    warn(message: string, metadata?: LogMetadata): void {
        const consoleMethod = getConsoleMethod('warn');
        consoleMethod(formatLogMessage('warn', message, metadata));
    },

    error(message: string, error?: unknown, metadata?: LogMetadata): void {
        const consoleMethod = getConsoleMethod('error');
        const errorMetadata = {
            ...metadata,
            ...(error instanceof Error && {
                errorName: error.name,
                errorMessage: error.message,
                errorStack: error.stack,
            }),
        };
        consoleMethod(formatLogMessage('error', message, errorMetadata));
    },
};
