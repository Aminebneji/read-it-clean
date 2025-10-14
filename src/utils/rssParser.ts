import { XMLParser } from "fast-xml-parser";

export interface RSSItem {
    title: string;
    link: string;
    pubDate: string;
    description: string;
}

export function parseRSSData(xml: string): RSSItem[] {
    const parserInstance = new XMLParser({ ignoreAttributes: false });
    const json = parserInstance.parse(xml);
    const items = json.rss?.channel?.item ?? [];
    return items.map((item: RSSItem) => ({
        title: item.title,
        link: item.link,
        pubDate: item.pubDate,
        description: item.description,
    }));
}
