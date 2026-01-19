import { XMLParser } from "fast-xml-parser";
import { RSSItem } from "@/types/rss.types";
import { AppError, ERROR_CODES } from "./error.utils";
import { ERROR_MESSAGES } from "@/config/constants";

interface RssMediaContent {
    '@_url'?: string;
}

interface RssEnclosure {
    '@_url'?: string;
    '@_type'?: string;
}

interface RssImage {
    url?: string;
}

interface RssThumbnail {
    '@_url'?: string;
}

interface RawRssItem {
    title?: string;
    link?: string;
    pubDate?: string;
    description?: string;
    'media:content'?: RssMediaContent | RssMediaContent[];
    enclosure?: RssEnclosure | RssEnclosure[];
    image?: string | RssImage;
    'media:thumbnail'?: RssThumbnail | RssThumbnail[];
    [key: string]: unknown; // Permettre d'autres champs RSS sans erreur
}

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
            return [mapRssItem(rssItems as RawRssItem)];
        }

        return (rssItems as RawRssItem[]).map((item: RawRssItem) => mapRssItem(item));
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Erreur inconnue";
        throw new AppError(
            `${ERROR_MESSAGES.RSS_PARSE_FAILED}: ${errorMessage}`,
            ERROR_CODES.RSS_PARSE_FAILED,
            { originalError: errorMessage }
        );
    }
}

// Mappe un item RSS brut vers la structure RSSItem
function mapRssItem(item: RawRssItem): RSSItem {
    return {
        title: (item.title as string) || '',
        link: (item.link as string) || '',
        pubDate: (item.pubDate as string) || new Date().toISOString(),
        description: (item.description as string) || '',
        image: extractImageUrl(item),
    };
}

// Extrait l'URL de l'image d'un item RSS
function extractImageUrl(item: RawRssItem): string | undefined {
    const extractors = [
        // media:content (format Media RSS)
        () => {
            const mediaContent = Array.isArray(item['media:content'])
                ? item['media:content'][0]
                : item['media:content'];
            return (mediaContent as RssMediaContent | undefined)?.['@_url'];
        },

        // enclosure (format standard RSS)
        () => {
            const enclosure = Array.isArray(item.enclosure)
                ? item.enclosure[0]
                : item.enclosure;
            return (enclosure as RssEnclosure | undefined)?.['@_type']?.startsWith('image/')
                ? (enclosure as RssEnclosure | undefined)?.['@_url']
                : undefined;
        },

        // champ image direct
        () => {
            if (typeof item.image === 'string') return item.image;
            return (item.image as RssImage | undefined)?.url;
        },

        // media:thumbnail
        () => {
            const thumbnail = Array.isArray(item['media:thumbnail'])
                ? item['media:thumbnail'][0]
                : item['media:thumbnail'];
            return (thumbnail as RssThumbnail | undefined)?.['@_url'];
        }
    ];

    for (const extractor of extractors) {
        const url = extractor();
        if (url) return url;
    }

    return undefined;
}
