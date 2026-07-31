import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import ProductCard from "@/components/ProductCard";
import { buildSocialMeta } from "@/lib/seo";

const title = "Ebooks y guías descargables";
const description =
  "Ebooks y guías en PDF de asesoría de imagen: colorimetría, cápsulas de outfits y más. Accedé pagando o con un código.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/libros" },
  ...buildSocialMeta({ title, description, path: "/libros" }),
};

export default async function LibrosPage() {
  const supabase = await createClient();
  const { data: books } = await supabase
    .from("books")
    .select("*")
    .eq("is_active", true)
    .order("sort_order", { ascending: true });

  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <h1 className="mb-2 font-serif text-3xl">Ebooks y guías</h1>
      <p className="mb-8 text-[#1a1a1a]/70">
        Guías digitales protegidas. Accedé pagando o con un código enviado por email.
      </p>
      {!books || books.length === 0 ? (
        <p className="text-sm text-[#1a1a1a]/50">Todavía no hay guías publicadas.</p>
      ) : (
        <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-4">
          {books.map((book) => (
            <ProductCard
              key={book.id}
              href={`/libros/${book.id}`}
              image={book.cover_url}
              title={book.title}
              subtitle={book.author}
              price={book.price}
            />
          ))}
        </div>
      )}
    </div>
  );
}
