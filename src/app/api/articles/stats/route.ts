// app/api/articles/stats/route.ts
import { createErrorResponse, createSuccessResponse } from "@/utils/api.utils";
import { HTTP_STATUS } from "@/config/constants";
import { getArticleStats } from "@/services/article.service";

export async function GET() {
    try {
        const stats = await getArticleStats();
        return createSuccessResponse(stats, HTTP_STATUS.OK);
    } catch (error) {
        return createErrorResponse(
            error,
            HTTP_STATUS.INTERNAL_SERVER_ERROR,
            'GET /api/articles/stats'
        );
    }
}