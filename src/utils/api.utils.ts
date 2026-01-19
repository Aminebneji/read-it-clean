import { NextResponse } from 'next/server';
import { ApiSuccessResponse, ApiErrorResponse } from '@/types/api.types';
import { formatErrorMessage } from '@/utils/error.utils';

// Crée une réponse de succès standardisée 
export function createSuccessResponse<T>(
    data: T,
    processedCount?: number
): NextResponse<ApiSuccessResponse<T>> {
    return NextResponse.json({
        success: true,
        data,
        ...(processedCount !== undefined && { processedCount }),
    });
}


// Crée une réponse d'erreur standardisée 
export function createErrorResponse(
    error: unknown,
    statusCode: number = 500,
    context?: string
): NextResponse<ApiErrorResponse> {
    const errorMessage = formatErrorMessage(error, context);

    // Log the error on the server for debugging
    console.error(`[API Error] ${errorMessage}`, error);

    return NextResponse.json(
        {
            success: false,
            error: errorMessage,
        },
        { status: statusCode }
    );
}


// Gère les erreurs dans les routes API
export function handleApiError(
    error: unknown,
    context?: string
): NextResponse<ApiErrorResponse> {
    console.error(formatErrorMessage(error, context));
    return createErrorResponse(error, 500, context);
}
