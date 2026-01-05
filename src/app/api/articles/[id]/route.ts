import { createErrorResponse, createSuccessResponse } from "@/utils/api.utils";
import { HTTP_STATUS } from "@/config/constants";
import { getArticleById, deleteArticle } from "@/services/article.service";
import { getServerSession } from "next-auth";
import { authOptions } from "@/config/auth.config";
import { NextRequest } from "next/server";

export async function GET(
    request: NextRequest,
    props: { params: Promise<{ id: string }> }
) {
    const params = await props.params;
    try {
        const session = await getServerSession(authOptions);
        if (!session || session.user.role !== 'ADMIN') {
            return createErrorResponse(new Error("Unauthorized"), HTTP_STATUS.UNAUTHORIZED);
        }

        const article = await getArticleById(params.id);
        return createSuccessResponse(article, HTTP_STATUS.OK);
    } catch (error) {
        return createErrorResponse(error, HTTP_STATUS.INTERNAL_SERVER_ERROR, `GET /api/articles/${params.id}`);
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