import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { buildSocialMeta, SITE_NAME } from "@/lib/seo";
import { sanitizeHtml } from "@/lib/sanitizeHtml";

const title = "Preguntas frecuentes";
const description = `Dudas comunes sobre los servicios de ${SITE_NAME}: modalidad, precios y tiempos.`;

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/faq" },
  ...buildSocialMeta({ title, description, path: "/faq" }),
};

export default async function FaqPage() {
  const supabase = await createClient();
  const { data: faqs } = await supabase
    .from("faqs")
    .select("*")
    .eq("is_active", true)
    .order("sort_order", { ascending: true });

  const faqJsonLd = faqs && faqs.length > 0 ? {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.question,
      acceptedAnswer: { "@type": "Answer", text: f.answer.replace(/<[^>]+>/g, " ") },
    })),
  } : null;

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      {faqJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
        />
      )}
      <h1 className="mb-2 font-serif text-3xl">Preguntas frecuentes</h1>
      <p className="mb-8 text-[#1a1a1a]/70">Dudas comunes sobre el servicio, modalidad, precios y tiempos.</p>

      {!faqs || faqs.length === 0 ? (
        <p className="text-sm text-[#1a1a1a]/50">Todavía no hay preguntas cargadas.</p>
      ) : (
        <div className="flex flex-col divide-y divide-black/10 border-y border-black/10">
          {faqs.map((f) => (
            <details key={f.id} className="group py-4">
              <summary className="flex cursor-pointer list-none items-center justify-between font-medium">
                {f.question}
                <span className="text-[#1a1a1a]/40 transition group-open:rotate-45">+</span>
              </summary>
              <div
                className="prose prose-sm mt-3 max-w-none text-sm text-[#1a1a1a]/70 [&_a]:underline [&_li]:ml-4 [&_ol]:list-decimal [&_p]:mb-2 [&_ul]:list-disc"
                dangerouslySetInnerHTML={{ __html: sanitizeHtml(f.answer) }}
              />
            </details>
          ))}
        </div>
      )}
    </div>
  );
}
