import DOMPurify from "isomorphic-dompurify";

// HTML sanitization avec DOMPurify pour une protection contre les attaques XSS
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
