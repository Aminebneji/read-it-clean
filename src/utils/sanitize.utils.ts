import sanitize from "sanitize-html";

const ALLOWED_TAGS = [
    'p', 'b', 'i', 'em', 'strong', 'a', 'ul', 'ol', 'li', 'br', 'hr',
    'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote', 'img', 'iframe',
    'span', 'div', 'code', 'pre'
];

const ALLOWED_ATTR = {
    'a': ['href', 'name', 'target', 'rel'],
    'img': ['src', 'alt', 'title', 'width', 'height'],
    'iframe': ['src', 'width', 'height', 'frameborder', 'allow', 'allowfullscreen', 'scrolling'],
    '*': ['class', 'alt', 'title']
};

/**
 * HTML sanitization using sanitize-html.
 * Standardized across client and server for consistency.
 */
export function sanitizeHtml(html: string): string {
    if (!html) return html;

    return sanitize(html, {
        allowedTags: ALLOWED_TAGS,
        allowedAttributes: ALLOWED_ATTR,
        allowedIframeHostnames: ['www.youtube.com', 'youtube.com', 'player.vimeo.com', 'www.dailymotion.com']
    });
}
