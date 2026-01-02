import { fetchMergedRssFeeds } from "@/services/rss.service";
import { logger } from "@/utils/logger.utils";

// Job de mise à jour des articles depuis les flux RSS

export async function updateArticlesJob(): Promise<void> {
    try {
        logger.info('Starting article update job');

        const rssArticles = await fetchMergedRssFeeds();

        for (const article of rssArticles) {
            logger.info(`Processing article: ${article.title}`, {
                link: article.link,
                pubDate: article.pubDate,
                image: article.image,
            });

            // TODO: Implémenter la logique de sauvegarde des articles
        }

        logger.success(`Article update job completed. Processed ${rssArticles.length} articles`);
    } catch (error) {
        logger.error('Article update job failed', error);
        throw error;
    }
}