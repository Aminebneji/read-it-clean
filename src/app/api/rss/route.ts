import { HTTP_STATUS } from "@/config/constants";
import { fetchMergedRssFeeds } from "@/services/sourcing.service";
import { createErrorResponse, createSuccessResponse } from "@/utils/api.utils";

//GET /api/rss
//Récupère tous les flux RSS fusionnés et triés

export async function GET() {
    try {
        const mergedRssFeeds = await fetchMergedRssFeeds();
        return createSuccessResponse(mergedRssFeeds, mergedRssFeeds.length);
    } catch (error) {
        return createErrorResponse(
            error,
            HTTP_STATUS.SERVICE_UNAVAILABLE,
            'GET /api/rss'
        );
    }
}
