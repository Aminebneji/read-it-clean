import DOMPurify from "isomorphic-dompurify";
import { CLAUDE_CONFIG } from "@/config/app.config";
import { logger } from "./logger.utils";

// HTML sanitization using DOMPurify for robust XSS protection
export function sanitizeHtml(html: string): string {
    if (!html) return html;

    return DOMPurify.sanitize(html, {
        ALLOWED_TAGS: [
            'p', 'b', 'i', 'em', 'strong', 'a', 'ul', 'ol', 'li', 'br', 'hr',
            'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote', 'img', 'iframe',
            'span', 'div', 'code', 'pre'
        ],
        ALLOWED_ATTR: [
            'href', 'src', 'alt', 'title', 'target', 'rel', 'class',
            'width', 'height', 'frameborder', 'allow', 'allowfullscreen'
        ],
        ADD_TAGS: ['iframe'],
        ADD_ATTR: ['allow', 'allowfullscreen', 'frameborder', 'scrolling'],
        FORBID_TAGS: ['script', 'style', 'form', 'input', 'button', 'textarea', 'select'],
        FORBID_ATTR: ['onerror', 'onclick', 'onload', 'onmouseover'],
    });
}

export function isValidUrl(url: string): boolean {
    try {
        new URL(url);
        return true;
    } catch {
        return false;
    }
}

interface UsageData {
    tokens: number;
    lastReset: string; // ISO
}


class UsageTracker {
    private static instance: UsageTracker;
    private dailyLimit: number = 100000; // Default limit $CLAUDE_DAILY_TOKEN_LIMIT
    private usage: UsageData = { tokens: 0, lastReset: new Date().toISOString() };

    private constructor() {
        this.dailyLimit = CLAUDE_CONFIG.dailyTokenLimit;
        this.resetIfNeeded();
    }

    public static getInstance(): UsageTracker {
        if (!UsageTracker.instance) {
            UsageTracker.instance = new UsageTracker();
        }
        return UsageTracker.instance;
    }

    private resetIfNeeded() {
        const now = new Date();
        const lastReset = new Date(this.usage.lastReset);

        if (now.getUTCDate() !== lastReset.getUTCDate() ||
            now.getUTCMonth() !== lastReset.getUTCMonth() ||
            now.getUTCFullYear() !== lastReset.getUTCFullYear()) {
            this.usage = { tokens: 0, lastReset: now.toISOString() };
            logger.info("Claude usage counter reset for the new day.");
        }
    }

    public canUse(tokensToEstimate: number = 0): boolean {
        this.resetIfNeeded();
        return (this.usage.tokens + tokensToEstimate) <= this.dailyLimit;
    }

    public recordUsage(tokensUsed: number) {
        this.resetIfNeeded();
        this.usage.tokens += tokensUsed;
        logger.info(`Claude usage: ${this.usage.tokens}/${this.dailyLimit} tokens used today.`);
    }

    public getRemainingTokens(): number {
        this.resetIfNeeded();
        return Math.max(0, this.dailyLimit - this.usage.tokens);
    }

    public getLimit(): number {
        return this.dailyLimit;
    }
}

export const tracker = UsageTracker.getInstance();
