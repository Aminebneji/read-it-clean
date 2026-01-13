import { NextRequest } from 'next/server';
import { articleEventEmitter, ARTICLE_EVENTS } from '@/utils/events.utils';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
    const stream = new ReadableStream({
        start(controller) {
            const encoder = new TextEncoder();

            const sendEvent = (event: string, data: any) => {
                const message = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
                controller.enqueue(encoder.encode(message));
            };

            // Ecoute des différents events sur les articles
            const onUpdate = (article: any) => sendEvent('update', article);
            const onDelete = (id: any) => sendEvent('delete', id);
            const onPinChange = (article: any) => sendEvent('pinChange', article);

            articleEventEmitter.on(ARTICLE_EVENTS.UPDATED, onUpdate);
            articleEventEmitter.on(ARTICLE_EVENTS.DELETED, onDelete);
            articleEventEmitter.on(ARTICLE_EVENTS.PINNED_CHANGED, onPinChange);

            // Fermer la connection
            request.signal.addEventListener('abort', () => {
                articleEventEmitter.off(ARTICLE_EVENTS.UPDATED, onUpdate);
                articleEventEmitter.off(ARTICLE_EVENTS.DELETED, onDelete);
                articleEventEmitter.off(ARTICLE_EVENTS.PINNED_CHANGED, onPinChange);
                controller.close();
            });

            // Garder le contact avec le serv via un ping
            sendEvent('connected', { timestamp: Date.now() });
        }
    });

    return new Response(stream, {
        headers: {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache, no-transform',
            'Connection': 'keep-alive',
        },
    });
}
