import { fetchMergedRssFeeds } from "@/services/rss.service";
import { createSuccessResponse, handleApiError } from "@/utils/api.utils";

//GET /api/rss
//Récupère tous les flux RSS fusionnés et triés

export async function GET() {
    try {
        const mergedRssFeeds = await fetchMergedRssFeeds();
        return createSuccessResponse(mergedRssFeeds, mergedRssFeeds.length);
    } catch (error) {
        return handleApiError(error, 'GET /api/rss');
    }
}
