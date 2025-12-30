import { fetchRssFeedXml } from "@/utils/fetchRssFeed";
import { parseRssFeedXml } from "@/utils/rssParser";
import { RSSItem, RSSFeedCollection } from "@/types/rss.types";
import { RSS_CONFIG } from "@/config/app.config";
import { AppError, ERROR_CODES } from "@/utils/error.utils";
import { ERROR_MESSAGES } from "@/config/constants";
import { logger } from "@/utils/logger.utils";


//Récupère tous les flux RSS organisés par catégorie
//retourne Collection de flux RSS indexés par catégorie

export async function fetchAllRssFeedsByCategory(): Promise<RSSFeedCollection> {
    const feedEntries = Object.entries(RSS_CONFIG.feeds);

    const results = await Promise.all(
        feedEntries.map(async ([category, feedUrl]) => {
            if (!feedUrl || feedUrl.trim() === '') {
                throw new AppError(
                    `${ERROR_MESSAGES.RSS_FEED_NOT_CONFIGURED}: ${category}`,
                    ERROR_CODES.RSS_INVALID_URL,
                    { category }
                );
            }

            try {
                logger.debug(`Fetching RSS feed for category: ${category}`, { feedUrl });

                const xmlContent = await fetchRssFeedXml(feedUrl);
                const rssItems = parseRssFeedXml(xmlContent);

                logger.success(`Successfully fetched ${rssItems.length} items for category: ${category}`);

                return [category, rssItems] as const;
            } catch (error) {
                logger.error(`Failed to fetch RSS feed for category: ${category}`, error);
                throw error;
            }
        })
    );

    return Object.fromEntries(results);
}


//   Récupère et fusionne tous les flux RSS en une seule liste triée par date
//   retourne une liste fusionnée de tous les items RSS, triés du plus récent au plus ancien

export async function fetchMergedRssFeeds(): Promise<RSSItem[]> {
    try {
        logger.debug('Fetching and merging all RSS feeds');

        const feedsByCategory = await fetchAllRssFeedsByCategory();
        const allItems = Object.values(feedsByCategory).flat();
        const sortedItems = allItems.sort(
            (itemA, itemB) =>
                new Date(itemB.pubDate).getTime() - new Date(itemA.pubDate).getTime()
        );

        logger.success(`Successfully merged ${sortedItems.length} total RSS items`);

        return sortedItems;
    } catch (error) {
        logger.error('Failed to fetch and merge RSS feeds', error);
        throw error;
    }
}
