import { CLAUDE_CONFIG } from "@/config/app.config";
import { logger } from "./logger.utils";


// HTML sanitization to strip script tags and other dangerous elements. 
export function sanitizeHtml(html: string): string {
    if (!html) return html;

    let sanitized = html;

    // 1. Remove script tags and their content
    sanitized = sanitized.replace(/<script\b[^>]*>([\s\S]*?)<\/script>/gim, "");

    // 2. Remove "on" event handlers and other dangerous attributes
    const dangerousAttributes = ['onclick', 'onerror', 'ononload', 'onmouseover', 'onfocus', 'onblur', 'style', 'formaction'];
    const attrRegex = new RegExp(`\\s(${dangerousAttributes.join('|')})\\s*=\\s*["'][^"']*["']`, 'gim');
    sanitized = sanitized.replace(attrRegex, "");

    // 3. Prevent javascript: protocol in href/src
    sanitized = sanitized.replace(/(href|src|action|data)\s*=\s*["']\s*javascript:[^"']*["']/gim, '$1="#"');

    // 4. Handle iframes/objects/embeds (only allow specific YouTube embeds)
    sanitized = sanitized.replace(/<(iframe|object|embed|base)\b[^>]*>([\s\S]*?)<\/\1>/gim, (match, tag) => {
        if (tag.toLowerCase() === 'iframe' && isSafeYoutubeUrl(match)) {
            return match;
        }
        return "";
    });

    sanitized = sanitized.replace(/<(iframe|object|embed|base)\b[^>]*\/?>/gim, (match) => {
        if (match.toLowerCase().startsWith('<iframe') && isSafeYoutubeUrl(match)) {
            return match;
        }
        return "";
    });

    return sanitized;
}

function isSafeYoutubeUrl(html: string): boolean {
    const srcMatch = html.match(/src=["']([^"']+)["']/i);
    if (!srcMatch) return false;
    const url = srcMatch[1];
    return url.startsWith('https://www.youtube.com/embed/') || url.startsWith('https://youtube.com/embed/');
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
    lastReset: string; // ISO Date
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
