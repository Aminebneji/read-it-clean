import { createErrorResponse, createSuccessResponse } from "@/utils/api.utils";
import { HTTP_STATUS } from "@/config/constants";
import { getArticles } from "@/services/article.service";
import { NextRequest } from "next/server";

// GET /api/articles - Récupère tous les articles
export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '20');
        const onlyWithoutText = searchParams.get('onlyWithoutText') === 'true';
        const category = searchParams.get('category') || undefined;

        const skip = (page - 1) * limit;

        const { articles, total } = await getArticles({
            skip,
            take: limit,
            onlyWithoutText,
            category,
        });

        return createSuccessResponse(
            {
                articles,
                pagination: {
                    page,
                    limit,
                    total,
                    totalPages: Math.ceil(total / limit),
                },
            },
            HTTP_STATUS.OK
        );
    } catch (error) {
        return createErrorResponse(
            error,
            HTTP_STATUS.INTERNAL_SERVER_ERROR,
            'GET /api/articles'
        );
    }
}