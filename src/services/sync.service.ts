import { fetchMergedRssFeeds } from "@/services/sourcing.service";
import { saveArticlesBatch } from "@/services/article.service";
import { logger } from "@/utils/logger.utils";

// Job de synchronisation des flux RSS vers la base de données
export async function syncRssFeedsToDatabase(): Promise<{
    saved: number;
    new: number;
    updated: number;
}> {
    try {
        logger.info('Starting RSS sync job');

        const rssArticles = await fetchMergedRssFeeds();
        logger.info(`Fetched ${rssArticles.length} articles from RSS feeds`);

        const result = await saveArticlesBatch(rssArticles);

        logger.success(
            `RSS sync completed: ${result.new} new articles, ${result.updated} updated articles`
        );

        return result;
    } catch (error) {
        logger.error('RSS sync job failed', error);
        throw error;
    }
}