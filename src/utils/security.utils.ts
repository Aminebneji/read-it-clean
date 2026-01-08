import { CLAUDE_CONFIG } from "@/config/app.config";
import { logger } from "./logger.utils";


// HTML sanitization to strip script tags and other dangerous elements. 
export function sanitizeHtml(html: string): string {
    if (!html) return html;

    // Strip <script> tags and their contents
    let sanitized = html.replace(/<script\b[^>]*>([\s\S]*?)<\/script>/gim, "");

    // Strip on attributes (onclick, onerror, etc.)
    sanitized = sanitized.replace(/\son\w+="[^"]*"/gim, "");
    sanitized = sanitized.replace(/\son\w+='[^']*'/gim, "");

    // Strip javascript: URLs
    sanitized = sanitized.replace(/href\s*=\s*"javascript:[^"]*"/gim, 'href="#"');
    sanitized = sanitized.replace(/src\s*=\s*"javascript:[^"]*"/gim, 'src=""');

    // Strip <iframe>, <object>, <embed>, <base> tags
    sanitized = sanitized.replace(/<(iframe|object|embed|base)\b[^>]*>([\s\S]*?)<\/\1>/gim, "");
    sanitized = sanitized.replace(/<(iframe|object|embed|base)\b[^>]*\/?>/gim, "");

    return sanitized;
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
