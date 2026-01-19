import DOMPurify from "isomorphic-dompurify";
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

// HTML sanitization avec DOMPurify (client) ou sanitize-html (serveur)
export function sanitizeHtml(html: string): string {
    if (!html) return html;

    // Sur le serveur, on évite DOMPurify car il tire jsdom (trop lourd et buggé en Serverless)
    if (typeof window === 'undefined') {
        return sanitize(html, {
            allowedTags: ALLOWED_TAGS,
            allowedAttributes: ALLOWED_ATTR,
            allowedIframeHostnames: ['www.youtube.com', 'player.vimeo.com']
        });
    }

    // Dans le navigateur, DOMPurify est ultra-performant et léger
    return DOMPurify.sanitize(html, {
        ALLOWED_TAGS,
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
