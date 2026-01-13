// Structure d'un article 
export interface article {
    id: string;
    title: string;
    link: string;
    description: string;
    image?: string;
    category?: string;
    published: boolean;
    pubDate?: string;
    createdAt: string;
    updatedAt: string;
    generatedText?: string;
    isGenerated: boolean;
    generatedAt?: string;
    pinned: boolean;
}