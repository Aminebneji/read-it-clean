import { createErrorResponse, createSuccessResponse } from "@/utils/api.utils";
import { HTTP_STATUS } from "@/config/constants";
import { prisma } from "@/config/prisma";

export async function GET() {
    try {
        const pinnedArticles = await prisma.article.findMany({
            where: {
                pinned: true,
                published: true,
            },
            take: 4,
            orderBy: { pubDate: 'desc' },
        });

        return createSuccessResponse(pinnedArticles, HTTP_STATUS.OK);
    } catch (error) {
        return createErrorResponse(
            error,
            HTTP_STATUS.INTERNAL_SERVER_ERROR,
            'GET /api/articles/pinned'
        );
    }
}
