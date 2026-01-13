import { createErrorResponse, createSuccessResponse } from "@/utils/api.utils";
import { HTTP_STATUS } from "@/config/constants";
import { getArticleById, deleteArticle, updateArticle, getArticles } from "@/services/article.service";
import { getServerSession } from "next-auth";
import { authOptions } from "@/config/auth.config";
import { NextRequest } from "next/server";
import { sanitizeHtml } from "@/utils/security.utils";

export async function GET(
    request: NextRequest,
    props: { params: Promise<{ id: string }> }
) {
    const params = await props.params;
    try {
        const article = await getArticleById(params.id);
        if (!article.published) {
            const session = await getServerSession(authOptions);
            if (!session || session.user.role !== 'ADMIN') {
                return createErrorResponse(new Error("Article non publié"), HTTP_STATUS.FORBIDDEN);
            }
        }

        return createSuccessResponse(article, HTTP_STATUS.OK);
    } catch (error) {
        return createErrorResponse(error, HTTP_STATUS.INTERNAL_SERVER_ERROR, `GET /api/articles/${params.id}`);
    }
}

export async function PATCH(
    request: NextRequest,
    props: { params: Promise<{ id: string }> }
) {
    const params = await props.params;
    try {
        const session = await getServerSession(authOptions);
        if (!session || session.user.role !== 'ADMIN') {
            return createErrorResponse(new Error("Unauthorized"), HTTP_STATUS.UNAUTHORIZED);
        }

        const body = await request.json();
        const { title, description, generatedText, published, pinned } = body;

        if (pinned === true) {
            const article = await getArticleById(params.id);
            if (!article.isGenerated) {
                return createErrorResponse(new Error("L'article doit être généré avant d'être épinglé"), HTTP_STATUS.BAD_REQUEST);
            }

            const { articles: currentPinned } = await getArticles({ publishedOnly: false });
            const pinnedCount = currentPinned.filter((a: any) => a.pinned).length;
            if (pinnedCount >= 4) {
                return createErrorResponse(new Error("Nombre maximum d'articles épinglés atteint (4)"), HTTP_STATUS.BAD_REQUEST);
            }
        }

        const updatedArticle = await updateArticle(params.id, {
            title: title ? sanitizeHtml(title) : undefined,
            description: description ? sanitizeHtml(description) : undefined,
            generatedText: generatedText ? sanitizeHtml(generatedText) : undefined,
            published: typeof published === 'boolean' ? published : undefined,
            pinned: typeof pinned === 'boolean' ? pinned : undefined,
        });

        return createSuccessResponse(updatedArticle, HTTP_STATUS.OK);
    } catch (error) {
        return createErrorResponse(error, HTTP_STATUS.INTERNAL_SERVER_ERROR, `PATCH /api/articles/${params.id}`);
    }
}

export async function DELETE(
    request: NextRequest,
    props: { params: Promise<{ id: string }> }
) {
    const params = await props.params;
    try {
        const session = await getServerSession(authOptions);
        if (!session || session.user.role !== 'ADMIN') {
            return createErrorResponse(new Error("Unauthorized"), HTTP_STATUS.UNAUTHORIZED);
        }

        await deleteArticle(params.id);
        return createSuccessResponse({ success: true }, HTTP_STATUS.OK);
    } catch (error) {
        return createErrorResponse(error, HTTP_STATUS.INTERNAL_SERVER_ERROR, `DELETE /api/articles/${params.id}`);
    }
}