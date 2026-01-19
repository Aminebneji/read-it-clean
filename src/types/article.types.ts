// Structure d'un article 
export interface article {
    id: number;
    title: string;
    link: string;
    description: string | null;
    image?: string | null;
    category: string;
    published: boolean;
    pubDate: string | Date;
    createdAt: string | Date;
    updatedAt: string | Date;
    generatedText?: string | null;
    isGenerated: boolean;
    generatedAt?: string | Date | null;
    pinned: boolean;
}