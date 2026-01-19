import { createErrorResponse, createSuccessResponse } from "@/utils/api.utils";
import { HTTP_STATUS } from "@/config/constants";
import { getServerSession } from "next-auth";
import { authOptions } from "@/config/auth.config";
import { fetchWowheadArticle } from "@/services/sourcing.service";
import { saveArticle } from "@/services/article.service";
import { generateTextForArticle } from "@/services/claude.service";
import { RSSItem } from "@/types/rss.types";

export async function POST(request: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || session.user.role !== 'ADMIN') {
            return createErrorResponse(
                new Error("Unauthorized"),
                HTTP_STATUS.UNAUTHORIZED,
                'POST /api/admin/articles/generate-from-link'
            );
        }

        const { url } = await request.json();

        if (!url || !url.includes("wowhead.com")) {
            return createErrorResponse(
                new Error("URL Wowhead invalide"),
                HTTP_STATUS.BAD_REQUEST,
                'POST /api/admin/articles/generate-from-link'
            );
        }

        // 1. Scraper Wowhead
        const scrapedData = await fetchWowheadArticle(url);

        // 2. Sauvegarder dans la base de données
        const { id } = await saveArticle(scrapedData as RSSItem);

        // 3. appeler l'IA pour générer le contenu
        const generatedArticle = await generateTextForArticle(id, { force: true });

        return createSuccessResponse(generatedArticle, HTTP_STATUS.OK);
    } catch (error) {
        return createErrorResponse(
            error,
            HTTP_STATUS.INTERNAL_SERVER_ERROR,
            'POST /api/admin/articles/generate-from-link'
        );
    }
}
