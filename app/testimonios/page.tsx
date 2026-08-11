import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { buildSocialMeta, SITE_NAME } from "@/lib/seo";
import TestimonioCard from "@/components/TestimonioCard";

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
      <p className="mb-2 text-[#1a1a1a]/70">Lo que dicen mis clientas.</p>
      <p className="mb-8 text-sm">
        <Link href="/testimonios/enviar" className="underline hover:text-lilac-deep">
          ¿Ya me conocés? Dejá tu testimonio
        </Link>
      </p>

      {!testimonios || testimonios.length === 0 ? (
        <p className="text-sm text-[#1a1a1a]/50">Todavía no hay testimonios publicados.</p>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 md:grid-cols-3">
          {testimonios.map((t) => (
            <TestimonioCard key={t.id} testimonio={t} />
          ))}
        </div>
      )}
    </div>
  );
}
