const ALLOWED_TAGS = new Set([
  "p",
  "br",
  "b",
  "strong",
  "i",
  "em",
  "u",
  "ul",
  "ol",
  "li",
  "a",
  "div",
  "span",
]);

const ALLOWED_ATTRS: Record<string, string[]> = {
  a: ["href", "target", "rel"],
  div: ["style"],
  span: ["style"],
  p: ["style"],
};

/**
 * Sanea el HTML que guarda RichTextEditor antes de mostrarlo en las páginas
 * públicas. Es un allowlist manual (sin jsdom/DOMPurify) porque isomorphic-dompurify
 * rompe en el runtime serverless de Vercel al empaquetarse con Turbopack.
 */
export function sanitizeHtml(html: string): string {
  if (!html) return "";
  return html.replace(/<\/?([a-zA-Z0-9]+)((?:\s+[a-zA-Z-]+\s*=\s*"[^"]*")*)\s*\/?>/g, (match, rawTag, attrs) => {
    const tag = String(rawTag).toLowerCase();
    if (!ALLOWED_TAGS.has(tag)) return "";
    if (match.startsWith("</")) return `</${tag}>`;

    const allowed = ALLOWED_ATTRS[tag] || [];
    let safeAttrs = "";
    const attrRegex = /([a-zA-Z-]+)\s*=\s*"([^"]*)"/g;
    let m: RegExpExecArray | null;
    while ((m = attrRegex.exec(attrs))) {
      const [, name, value] = m;
      const attrName = name.toLowerCase();
      if (!allowed.includes(attrName)) continue;
      if (attrName === "href" && /^\s*javascript:/i.test(value)) continue;
      safeAttrs += ` ${attrName}="${value.replace(/"/g, "&quot;")}"`;
    }
    return `<${tag}${safeAttrs}>`;
  });
}
