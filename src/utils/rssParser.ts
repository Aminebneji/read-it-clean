import { XMLParser } from "fast-xml-parser";
import { RSSItem } from "@/types/rss.types";
import { AppError, ERROR_CODES } from "./error.utils";
import { ERROR_MESSAGES } from "@/config/constants";

export function parseRssFeedXml(xmlContent: string): RSSItem[] {
    if (!xmlContent || xmlContent.trim() === '') {
        throw new AppError(
            `${ERROR_MESSAGES.RSS_PARSE_FAILED}: Contenu XML vide`,
            ERROR_CODES.RSS_PARSE_FAILED
        );
    }

    try {
        const xmlParser = new XMLParser({ ignoreAttributes: false });
        const parsedData = xmlParser.parse(xmlContent);

        const rssItems = parsedData.rss?.channel?.item ?? [];

        if (!Array.isArray(rssItems) && rssItems) {
            // Si un seul item, le convertir en tableau
            return [mapRssItem(rssItems)];
        }

        return rssItems.map((item: RSSItem) => mapRssItem(item));
    } catch (error) {
        throw new AppError(
            `${ERROR_MESSAGES.RSS_PARSE_FAILED}: ${(error as Error).message}`,
            ERROR_CODES.RSS_PARSE_FAILED,
            { originalError: (error as Error).message }
        );
    }
}


// Mappe un item RSS brut vers la structure RSSItem
function mapRssItem(item: any): RSSItem {
    return {
        title: item.title || '',
        link: item.link || '',
        pubDate: item.pubDate || new Date().toISOString(),
        description: item.description || '',
        image: extractImageUrl(item),
    };
}

// Extrait l'URL de l'image d'un item RSS
function extractImageUrl(item: any): string | undefined {
    const extractors = [
        // media:content (format Media RSS)
        () => {
            const mediaContent = Array.isArray(item['media:content'])
                ? item['media:content'][0]
                : item['media:content'];
            return mediaContent?.['@_url'];
        },

        // enclosure (format standard RSS 2.0)
        () => {
            const enclosure = Array.isArray(item.enclosure)
                ? item.enclosure[0]
                : item.enclosure;
            return enclosure?.['@_type']?.startsWith('image/') ? enclosure?.['@_url'] : undefined;
        },

        // champ image direct
        () => {
            if (typeof item.image === 'string') return item.image;
            return item.image?.url;
        },

        // media:thumbnail
        () => {
            const thumbnail = Array.isArray(item['media:thumbnail'])
                ? item['media:thumbnail'][0]
                : item['media:thumbnail'];
            return thumbnail?.['@_url'];
        }
    ];

    for (const extractor of extractors) {
        const url = extractor();
        if (url) return url;
    }

    return undefined;
}
