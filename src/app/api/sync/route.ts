import { createErrorResponse, createSuccessResponse } from "@/utils/api.utils";
import { HTTP_STATUS } from "@/config/constants";
import { syncRssFeedsToDatabase } from "@/services/sync.service";
import { getServerSession } from "next-auth";
import { authOptions } from "@/config/auth.config";

// POST /api/sync - Synchronise les flux RSS vers la DB
export async function POST() {
    try {
        const session = await getServerSession(authOptions);

        if (!session || session.user.role !== 'ADMIN') {
            return createErrorResponse(
                new Error("Unauthorized"),
                HTTP_STATUS.UNAUTHORIZED,
                'POST /api/sync'
            );
        }

        const result = await syncRssFeedsToDatabase();

        return createSuccessResponse(result, HTTP_STATUS.OK);
    } catch (error) {
        return createErrorResponse(
            error,
            HTTP_STATUS.INTERNAL_SERVER_ERROR,
            'POST /api/sync'
        );
    }
}