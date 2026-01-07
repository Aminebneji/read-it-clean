import { prisma } from "@/config/prisma";
import { RSSItem } from "@/types/rss.types";
import { logger } from "@/utils/logger.utils";
import { AppError } from "@/utils/error.utils";
import { category, Prisma } from "@prisma/client";

function mapCategory(catString?: string): category {
    if (!catString) return category.Blizzard;
    const normalized = catString.toLowerCase();
    if (normalized.includes('classic')) return category.Classic;
    if (normalized.includes('retail')) return category.Retail;
    return category.Blizzard;
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

// Récupère tous les articles (pagination)
export async function getArticles(options?: {
    skip?: number;
    take?: number;
    onlyWithoutText?: boolean;
    category?: string;
}) {
    const where: Prisma.ArticleWhereInput = {};

    if (options?.onlyWithoutText) {
        where.isGenerated = false;
    }

    if (options?.category) {
        where.category = mapCategory(options.category);
    }

    const articles = await prisma.article.findMany({
        where,
        skip: options?.skip,
        take: options?.take,
        orderBy: { pubDate: 'desc' },
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

// Met à jour le texte généré pour un article
export async function updateArticleWithGeneratedText(
    id: string,
    generatedText: string
) {
    return updateArticle(id, {
        generatedText,
        isGenerated: true,
        generatedAt: new Date(),
    });
}

// Met à jour un article avec des inputs
export async function updateArticle(
    id: string,
    data: Prisma.ArticleUpdateInput
) {
    try {
        const article = await prisma.article.update({
            where: { id: parseInt(id) },
            data,
        });

        logger.success(`Article updated: ${article.title}`);
        return article;
    } catch (error) {
        logger.error(`Failed to update article: ${id}`, error);
        throw error;
    }
}

// Récupère les statistiques des articles ( trop fun)
export async function getArticleStats() {
    const [total, generated, notGenerated] = await Promise.all([
        prisma.article.count(),
        prisma.article.count({ where: { isGenerated: true } }),
        prisma.article.count({ where: { isGenerated: false } }),
    ]);

    return {
        total,
        generated,
        notGenerated,
        percentageGenerated: total > 0 ? Math.round((generated / total) * 100) : 0,
    };
}

// Supprime un article
export async function deleteArticle(id: string) {
    try {
        await prisma.article.delete({
            where: { id: parseInt(id) },
        });
        logger.success(`Article deleted: ${id}`);
    } catch (error) {
        logger.error(`Failed to delete article: ${id}`, error);
        throw error;
    }
}