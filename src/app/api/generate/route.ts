import { createErrorResponse } from "@/utils/api.utils";
import { HTTP_STATUS } from "@/config/constants";

// POST /api/generate
// Route pour générer du contenu avec Claude (à implémenter)

export async function POST() {

    // TODO: Implémenter la génération de contenu avec Claude
    return createErrorResponse(
        new Error('Cette route n\'est pas encore implémentée'),
        HTTP_STATUS.SERVICE_UNAVAILABLE,
        'POST /api/generate'
    );
}
