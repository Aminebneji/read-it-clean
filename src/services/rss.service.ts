// src/services/rss.service.ts
import { fetchRssFeed } from "@/utils/fetchRssFeed";
import { parseRSSData, RSSItem } from "@/utils/rssParser";

const RSS_FEEDS = {
    classic: process.env.CLASSIC_RSS_FEED,
    retail: process.env.RETAIL_RSS_FEED,
};

export async function fetchAllRSSFeeds(): Promise<Record<string, RSSItem[]>> {
    const entries = await Promise.all(
        Object.entries(RSS_FEEDS).map(async ([key, url]) => {
            if (!url) {
                throw new Error('RSS feed URL is not defined for ' + key);
            }
            const xml = await fetchRssFeed(url);
            const items = parseRSSData(xml);
            return [key, items] as const;
        })
    );
    return Object.fromEntries(entries);
}

export async function getAllRSSFeedsInOne(): Promise<RSSItem[]> {
    const feeds = await fetchAllRSSFeeds();
    const merged = [...feeds.classic, ...feeds.retail];
    return merged.sort(
        (a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime()
    );
}
