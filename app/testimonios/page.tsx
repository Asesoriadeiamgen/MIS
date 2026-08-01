import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { buildSocialMeta, SITE_NAME } from "@/lib/seo";

const title = "Testimonios";
const description = `Lo que dicen las clientas de ${SITE_NAME}.`;

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/testimonios" },
  ...buildSocialMeta({ title, description, path: "/testimonios" }),
};

export default async function TestimoniosPage() {
  const supabase = await createClient();
  const { data: testimonios } = await supabase
    .from("testimonios")
    .select("*")
    .eq("is_active", true)
    .order("sort_order", { ascending: true });

  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <h1 className="mb-2 font-serif text-3xl">Testimonios</h1>
      <p className="mb-8 text-[#1a1a1a]/70">Lo que dicen mis clientas.</p>

      {!testimonios || testimonios.length === 0 ? (
        <p className="text-sm text-[#1a1a1a]/50">Todavía no hay testimonios publicados.</p>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 md:grid-cols-3">
          {testimonios.map((t) => (
            <div key={t.id} className="rounded-sm border border-black/10 bg-white p-6 text-sm">
              {t.rating && (
                <p className="mb-2 text-lilac-deep">{"★".repeat(t.rating)}</p>
              )}
              <p className="text-[#1a1a1a]/80">&ldquo;{t.quote}&rdquo;</p>
              <p className="mt-4 font-medium">{t.client_name}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
