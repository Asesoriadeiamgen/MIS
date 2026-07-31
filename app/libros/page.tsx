import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import ProductCard from "@/components/ProductCard";
import { buildSocialMeta } from "@/lib/seo";

const title = "Libros digitales: Flores de Bach, Reiki y cuentos infantiles";
const description =
  "Libros digitales en PDF: manual y cartas de Flores de Bach, Reiki (Byosen), cuentos infantiles y libros de desarrollo personal. Accedé pagando o con un código.";

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
      <h1 className="mb-2 font-serif text-3xl">Libros</h1>
      <p className="mb-8 text-[#2b2622]/70">
        Libros digitales protegidos. Accedé pagando o con un código enviado por email.
      </p>
      {!books || books.length === 0 ? (
        <p className="text-sm text-[#2b2622]/50">Todavía no hay libros publicados.</p>
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
