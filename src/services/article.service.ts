import { prisma } from "@/config/prisma";
import { RSSItem } from "@/types/rss.types";
import { logger } from "@/utils/logger.utils";
import { AppError } from "@/utils/error.utils";
import { category, Prisma } from "@prisma/client";
import { ARTICLE_EVENTS, articleEventEmitter } from "@/utils/events.utils";

function mapCategory(catString?: string): category {
    if (!catString) return category.Retail;
    const normalized = catString.toLowerCase();
    if (normalized.includes('classic')) return category.Classic;
    return category.Retail;
}

// Sauvegarde un article RSS en DB 
export async function saveArticle(rssItem: RSSItem): Promise<{ id: string; isNew: boolean }> {
    try {
        const article = await prisma.article.upsert({
            where: { link: rssItem.link },
            update: {
                title: rssItem.title,
                description: rssItem.description,
                pubDate: new Date(rssItem.pubDate),
                image: rssItem.image,
                category: mapCategory(rssItem.category),
            },
            create: {
                title: rssItem.title,
                link: rssItem.link,
                description: rssItem.description,
                pubDate: new Date(rssItem.pubDate),
                image: rssItem.image,
                category: mapCategory(rssItem.category),
            },
        });

        logger.debug(`Article saved: ${article.title}`, { id: article.id });

        return {
            id: article.id.toString(),
            isNew: article.createdAt.getTime() === article.updatedAt.getTime(),
        };
    } catch (error) {
        logger.error(`Failed to save article: ${rssItem.link}`, error);
        throw error;
    }
}

// Sauvegarde plusieurs articles en batch
export async function saveArticlesBatch(rssItems: RSSItem[]): Promise<{
    saved: number;
    new: number;
    updated: number;
}> {
    let newCount = 0;
    let updatedCount = 0;

    for (const item of rssItems) {
        const result = await saveArticle(item);
        if (result.isNew) {
            newCount++;
        } else {
            updatedCount++;
        }
    }

    logger.success(`Batch save completed: ${newCount} new, ${updatedCount} updated`);

    return {
        saved: rssItems.length,
        new: newCount,
        updated: updatedCount,
    };
}

// Clause WHERE pour la recherche d'articles
function buildArticleWhereClause(options?: {
    category?: string;
    search?: string;
    published?: boolean;
    isGenerated?: boolean;
    publishedOnly?: boolean;
}): Prisma.ArticleWhereInput {
    return {
        ...(options?.category && options.category !== 'All' && { category: mapCategory(options.category) }),
        ...(options?.search && {
            OR: [
                { title: { contains: options.search, mode: 'insensitive' } },
                { description: { contains: options.search, mode: 'insensitive' } },
            ]
        }),
        ...(options?.published !== undefined && { published: options.published }),
        ...(options?.isGenerated !== undefined && { isGenerated: options.isGenerated }),
        ...(options?.publishedOnly === true && { published: true }),
    };
}

// Récupère tous les articles (pagination)
export async function getArticles(options?: {
    skip?: number;
    take?: number;
    category?: string;
    search?: string;
    sort?: 'asc' | 'desc';
    publishedOnly?: boolean;
    published?: boolean;
    isGenerated?: boolean;
    pinnedFirst?: boolean;
}) {
    const where = buildArticleWhereClause(options);

    const orderBy: Prisma.ArticleOrderByWithRelationInput[] = [];

    if (options?.pinnedFirst) {
        orderBy.push({ pinned: 'desc' });
    }

    orderBy.push(options?.sort === 'asc' ? { pubDate: 'asc' } : { pubDate: 'desc' });

    const articles = await prisma.article.findMany({
        where,
        skip: options?.skip,
        take: options?.take,
        orderBy,
    });

    const total = await prisma.article.count({ where });

    return { articles, total };
}

// Récupère un article par son ID
export async function getArticleById(id: string) {
    const article = await prisma.article.findUnique({
        where: { id: parseInt(id) },
    });

    if (!article) {
        throw new AppError(`Article not found: ${id}`, 'ARTICLE_NOT_FOUND');
    }

    return article;
}

// Met à jour le texte d'un un article
export async function updateArticleWithGeneratedText(id: string, generatedText: string) {
    return updateArticle(id, {
        generatedText,
        isGenerated: true,
        generatedAt: new Date(),
    });
}

// Met à jour un article
export async function updateArticle(id: string, data: Prisma.ArticleUpdateInput) {
    try {
        const article = await prisma.article.update({
            where: { id: parseInt(id) },
            data,
        });

        logger.success(`Article updated: ${article.title}`);

        // EventEmitter pour push l'info de pin 
        articleEventEmitter.emit(ARTICLE_EVENTS.UPDATED, article);
        if (data.pinned !== undefined) {
            articleEventEmitter.emit(ARTICLE_EVENTS.PINNED_CHANGED, article);
        }

        return article;
    } catch (error) {
        logger.error(`Failed to update article: ${id}`, error);
        throw error;
    }
}

// Supprime un article
export async function deleteArticle(id: string) {
    try {
        await prisma.article.delete({
            where: { id: parseInt(id) },
        });
        logger.success(`Article deleted: ${id}`);

        // Emit event for SSE
        articleEventEmitter.emit(ARTICLE_EVENTS.DELETED, id);
        articleEventEmitter.emit(ARTICLE_EVENTS.UPDATED); // Broad refresh signal
    } catch (error) {
        logger.error(`Failed to delete article: ${id}`, error);
        throw error;
    }
}

// Supprime plusieurs articles
export async function deleteArticlesBulk(ids: number[]) {
    try {
        await prisma.article.deleteMany({
            where: {
                id: { in: ids }
            }
        });
        logger.success(`Bulk delete completed for ${ids.length} articles`);

        articleEventEmitter.emit(ARTICLE_EVENTS.DELETED, ids);
        articleEventEmitter.emit(ARTICLE_EVENTS.UPDATED);
    } catch (error) {
        logger.error(`Failed to bulk delete articles: ${ids.join(', ')}`, error);
        throw error;
    }
}

// Récupère des articles similaires basés sur des mots-clés du titre et la catégorie
export async function getSimilarArticles(articleId: number, category: category, title: string, limit: number = 3) {
    // Extraction de mots-clés simples (mots de plus de 3 lettres, sans les mots communs)
    const stopWords = new Set(['dans', 'pour', 'avec', 'plus', 'fait', 'tous', 'cette', 'ceux', 'leurs', 'mais', 'elle', 'nous', 'vous', 'votre', 'leur']);
    const keywords = title
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, '')
        .split(/\s+/)
        .filter(word => word.length > 3 && !stopWords.has(word))
        .slice(0, 5); // On prend les 5 premiers mots significatifs

    // On cherche d'abord avec les mots-clés
    let similar = await prisma.article.findMany({
        where: {
            id: { not: articleId },
            published: true,
            OR: keywords.map(keyword => ({
                title: { contains: keyword, mode: 'insensitive' }
            })),
        },
        take: limit,
        orderBy: { pubDate: 'desc' },
    });

    // Si on n'a pas assez de résultats, on cherche la catégorie
    if (similar.length < limit) {
        const remaining = limit - similar.length;
        const fallback = await prisma.article.findMany({
            where: {
                id: {
                    notIn: [articleId, ...similar.map(a => a.id)]
                },
                category,
                published: true,
            },
            take: remaining,
            orderBy: { pubDate: 'desc' },
        });
        similar = [...similar, ...fallback];
    }

    return similar;
}