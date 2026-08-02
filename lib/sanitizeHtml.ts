import DOMPurify from "isomorphic-dompurify";

/** Sanea el HTML que guarda RichTextEditor antes de mostrarlo en las páginas públicas. */
export function sanitizeHtml(html: string): string {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ["p", "br", "b", "strong", "i", "em", "u", "ul", "ol", "li", "a", "div", "span"],
    ALLOWED_ATTR: ["href", "target", "rel", "style"],
  });
}
