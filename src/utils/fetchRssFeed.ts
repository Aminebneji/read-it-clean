import { AppError, ERROR_CODES } from './error.utils';
import { ERROR_MESSAGES } from '@/config/constants';


function isValidUrl(url: string): boolean {
    try {
        const urlObj = new URL(url);
        return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
    } catch {
        return false;
    }
}

// Récupère le contenu XML d'un flux RSS
//  retourne Le contenu XML du flux RSS
export async function fetchRssFeedXml(url: string): Promise<string> {
    // Validation de l'URL
    if (!url || !isValidUrl(url)) {
        throw new AppError(
            `${ERROR_MESSAGES.RSS_INVALID_URL}: ${url}`,
            ERROR_CODES.RSS_INVALID_URL,
            { url }
        );
    }

    try {
        const response = await fetch(url);

        if (!response.ok) {
            throw new AppError(
                `${ERROR_MESSAGES.RSS_FETCH_FAILED}: ${response.statusText}`,
                ERROR_CODES.RSS_FETCH_FAILED,
                { url, status: response.status, statusText: response.statusText }
            );
        }

        return await response.text();
    } catch (error) {
        // Si c'est déjà une AppError, on la relance
        if (error instanceof AppError) {
            throw error;
        }

        // Sinon, on crée une nouvelle AppError
        throw new AppError(
            `${ERROR_MESSAGES.RSS_FETCH_FAILED}: ${(error as Error).message}`,
            ERROR_CODES.NETWORK_ERROR,
            { url, originalError: (error as Error).message }
        );
    }
}
