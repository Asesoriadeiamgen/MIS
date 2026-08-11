"use client";

import { useState } from "react";
import { formatMonthYear } from "@/lib/format";
import { sanitizeHtml } from "@/lib/sanitizeHtml";
import type { Testimonio } from "@/types/database";

const PREVIEW_LENGTH = 140;

/** Solo para medir/recortar el largo del texto plano — el HTML completo se muestra sin tocar al expandir. */
function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, "");
}

export default function TestimonioCard({ testimonio }: { testimonio: Testimonio }) {
  const [expanded, setExpanded] = useState(false);
  const plainQuote = stripHtml(testimonio.quote);
  const needsTruncation = plainQuote.length > PREVIEW_LENGTH;

  return (
    <div className="flex flex-col rounded-sm border border-black/10 bg-white p-6 text-sm">
      {testimonio.rating && <p className="mb-2 text-lilac-deep">{"★".repeat(testimonio.rating)}</p>}
      {expanded || !needsTruncation ? (
        <div
          className="prose prose-sm max-w-none text-[#1a1a1a]/80 before:content-['\201C'] after:content-['\201D'] [&_p]:inline"
          dangerouslySetInnerHTML={{ __html: sanitizeHtml(testimonio.quote) }}
        />
      ) : (
        <p className="text-[#1a1a1a]/80 before:content-['\201C']">
          {plainQuote.slice(0, PREVIEW_LENGTH).trimEnd()}…
        </p>
      )}
      {needsTruncation && (
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="mt-2 self-start text-xs uppercase tracking-widest text-lilac-deep underline hover:text-[#1a1a1a]"
        >
          {expanded ? "Leer menos" : "Leer más"}
        </button>
      )}
      <div className="mt-4 flex items-center gap-3 border-t border-black/10 pt-3">
        {testimonio.photo_url && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={testimonio.photo_url}
            alt=""
            className="h-10 w-10 flex-shrink-0 rounded-full object-cover"
          />
        )}
        <div>
          <p className="font-medium">{testimonio.client_name}</p>
          <p className="text-xs text-[#1a1a1a]/50">
            {[testimonio.product_or_service, formatMonthYear(testimonio.purchase_month)]
              .filter(Boolean)
              .join(" · ")}
          </p>
        </div>
      </div>
    </div>
  );
}
