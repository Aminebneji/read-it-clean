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
        const category = searchParams.get('category') || undefined;
        const search = searchParams.get('search') || undefined;
        const sort = searchParams.get('sort') || 'desc';
        const publishedOnly = searchParams.get('publishedOnly') !== 'false'; // default true pour le public

        const skip = (page - 1) * limit;

        const { articles, total } = await getArticles({
            skip,
            take: limit,
            category,
            search,
            sort: sort as 'asc' | 'desc',
            publishedOnly,
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