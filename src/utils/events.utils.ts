import { EventEmitter } from 'events';

// Instance unique pour partager les événements entre les processus
declare global {
    var globalEventEmitter: EventEmitter | undefined;
}

export const articleEventEmitter = global.globalEventEmitter || new EventEmitter();

if (process.env.NODE_ENV !== 'production') {
    global.globalEventEmitter = articleEventEmitter;
}

export const ARTICLE_EVENTS = {
    UPDATED: 'article:updated',
    DELETED: 'article:deleted',
    PINNED_CHANGED: 'article:pinned_changed',
};
