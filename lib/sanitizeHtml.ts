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
 *
 * El regex externo matchea CUALQUIER cosa con forma de tag (sin importar cómo
 * vengan comillados los atributos, o si vienen sin comillas) para que nada
 * quede afuera del allowlist sin pasar por acá — la primera versión solo
 * reconocía atributos con comillas dobles bien formadas, y cualquier tag con
 * comillas simples o sin comillas se colaba sin tocar en el HTML final.
 */
export function sanitizeHtml(html: string): string {
  if (!html) return "";
  return html.replace(/<\/?[a-zA-Z][a-zA-Z0-9]*(?:\s[^<>]*)?>/g, (match) => {
    const closing = match.startsWith("</");
    const tag = (match.match(/^<\/?\s*([a-zA-Z][a-zA-Z0-9]*)/)?.[1] ?? "").toLowerCase();
    if (!ALLOWED_TAGS.has(tag)) return "";
    if (closing) return `</${tag}>`;

    const allowed = ALLOWED_ATTRS[tag] || [];
    let safeAttrs = "";
    // Solo se aceptan atributos con comillas (simples o dobles); cualquier
    // atributo sin comillas queda afuera directamente, nunca se propaga.
    const attrRegex = /([a-zA-Z-]+)\s*=\s*(?:"([^"]*)"|'([^']*)')/g;
    let m: RegExpExecArray | null;
    while ((m = attrRegex.exec(match))) {
      const attrName = m[1].toLowerCase();
      const value = m[2] !== undefined ? m[2] : m[3];
      if (!allowed.includes(attrName)) continue;
      if (attrName === "href" && /^\s*javascript:/i.test(value)) continue;
      safeAttrs += ` ${attrName}="${value.replace(/"/g, "&quot;")}"`;
    }
    return `<${tag}${safeAttrs}>`;
  });
}
