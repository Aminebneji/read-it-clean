// Structure d'un article RSS
export interface RSSItem {
    title: string;
    link: string;
    pubDate: string;
    description: string;
    image?: string;
}

// Collection de flux RSS organisés par catégorie
export interface RSSFeedCollection {
    [category: string]: RSSItem[];
}


//  Catégories de flux RSS disponibles
export type RSSFeedCategory = 'classic' | 'retail';
