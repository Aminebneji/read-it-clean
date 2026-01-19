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

        // Handle explicit published status or fallback to publishedOnly behavior
        const publishedParam = searchParams.get('published');
        const published = publishedParam === 'true' ? true : (publishedParam === 'false' ? false : undefined);

        const isGeneratedParam = searchParams.get('isGenerated');
        const isGenerated = isGeneratedParam === 'true' ? true : (isGeneratedParam === 'false' ? false : undefined);

        const publishedOnly = searchParams.get('publishedOnly') === 'true';
        const pinnedFirst = searchParams.get('pinnedFirst') === 'true';

        const skip = (page - 1) * limit;

        const { articles, total } = await getArticles({
            skip,
            take: limit,
            category,
            search,
            sort: sort as 'asc' | 'desc',
            published,
            isGenerated,
            publishedOnly: published === undefined ? publishedOnly : false,
            pinnedFirst,
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