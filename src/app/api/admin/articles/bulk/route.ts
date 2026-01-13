import { createErrorResponse, createSuccessResponse } from "@/utils/api.utils";
import { HTTP_STATUS } from "@/config/constants";
import { deleteArticlesBulk } from "@/services/article.service";
import { getServerSession } from "next-auth";
import { authOptions } from "@/config/auth.config";
import { NextRequest } from "next/server";

export async function DELETE(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || session.user.role !== 'ADMIN') {
            return createErrorResponse(new Error("Unauthorized"), HTTP_STATUS.UNAUTHORIZED);
        }

        const body = await request.json();
        const { ids } = body;

        if (!Array.isArray(ids) || ids.length === 0) {
            return createErrorResponse(new Error("Invalid IDs"), HTTP_STATUS.BAD_REQUEST);
        }

        await deleteArticlesBulk(ids.map(id => parseInt(id)));
        return createSuccessResponse({ success: true }, HTTP_STATUS.OK);
    } catch (error) {
        return createErrorResponse(error, HTTP_STATUS.INTERNAL_SERVER_ERROR, 'DELETE /api/admin/articles/bulk');
    }
}
