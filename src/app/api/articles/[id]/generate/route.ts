import { createErrorResponse, createSuccessResponse } from "@/utils/api.utils";
import { HTTP_STATUS } from "@/config/constants";
import { generateTextForArticle } from "@/services/claude.service";
import { getServerSession } from "next-auth";
import { authOptions } from "@/config/auth.config";

export async function POST(
    request: Request,
    props: { params: Promise<{ id: string }> }
) {
    const params = await props.params;
    try {
        const session = await getServerSession(authOptions);

        if (!session || session.user.role !== 'ADMIN') {
            return createErrorResponse(
                new Error("Unauthorized"),
                HTTP_STATUS.UNAUTHORIZED,
                `POST /api/articles/${params.id}/generate`
            );
        }

        const generatedText = await generateTextForArticle(params.id);

        return createSuccessResponse(
            { generatedText },
            HTTP_STATUS.OK
        );
    } catch (error) {
        return createErrorResponse(
            error,
            HTTP_STATUS.INTERNAL_SERVER_ERROR,
            `POST /api/articles/${params.id}/generate`
        );
    }
}