//  Structure de réponse API réussie
export interface ApiSuccessResponse<T> {
    success: true;
    data: T;
    processedCount?: number;
}


//  Structure de réponse API en erreur
export interface ApiErrorResponse {
    success: false;
    error: string;
}

//  Type union pour toutes les réponses API
export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;
