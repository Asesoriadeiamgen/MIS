import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { formatPrice } from "@/lib/format";
import AddToCartButton from "@/components/AddToCartButton";
import ProductTags from "@/components/ProductTags";
import WhatsappDeliveryNote from "@/components/WhatsappDeliveryNote";
import { redeemBookCode } from "@/app/libros/actions";
import { BUTTON_PRIMARY, BUTTON_OUTLINE, LABEL } from "@/lib/ui";
import { deriveTags, truncateDescription, buildSocialMeta, breadcrumbJsonLd, SITE_URL } from "@/lib/seo";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const supabase = await createClient();
  const { data: book } = await supabase.from("books").select("*").eq("id", id).single();
  if (!book) return {};

  const description = truncateDescription(book.description);
  return {
    title: book.title,
    description,
    alternates: { canonical: `/libros/${id}` },
    ...buildSocialMeta({ title: book.title, description, path: `/libros/${id}`, image: book.cover_url }),
  };
}

export default async function LibroDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ codeError?: string }>;
}) {
  const { id } = await params;
  const { codeError } = await searchParams;
  const supabase = await createClient();

  const { data: book } = await supabase.from("books").select("*").eq("id", id).single();
  if (!book) notFound();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  let hasAccess = false;
  if (user) {
    const { data: access } = await supabase
      .from("book_access")
      .select("id")
      .eq("book_id", id)
      .eq("user_id", user.id)
      .maybeSingle();
    hasAccess = !!access;
  }

  const tags = deriveTags("libro", book.title, book.author, book.description);
  const productJsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: book.title,
    description: book.description || undefined,
    image: book.cover_url || undefined,
    url: `${SITE_URL}/libros/${id}`,
    author: book.author ? { "@type": "Person", name: book.author } : undefined,
    offers: {
      "@type": "Offer",
      priceCurrency: "ARS",
      price: book.price,
      availability: "https://schema.org/InStock",
      url: `${SITE_URL}/libros/${id}`,
    },
  };

  const breadcrumbs = breadcrumbJsonLd([
    { name: "Inicio", path: "/" },
    { name: "Libros", path: "/libros" },
    { name: book.title, path: `/libros/${id}` },
  ]);

  return (
    <div className="mx-auto max-w-3xl px-4 py-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbs) }}
      />
      <div className="grid grid-cols-1 gap-10 sm:grid-cols-2">
        <div className="aspect-[3/4] overflow-hidden rounded-sm bg-soft-bg">
          {book.cover_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={book.cover_url} alt={book.title} className="h-full w-full object-contain" />
          ) : null}
        </div>
        <div>
          <h1 className="font-serif text-3xl">{book.title}</h1>
          {book.author && <p className="mt-1 text-[#1a1a1a]/60">{book.author}</p>}
          <p className="mt-4 text-xl font-semibold">{formatPrice(book.price)}</p>
          {book.description && <p className="mt-4 text-sm text-[#1a1a1a]/80">{book.description}</p>}
          <ProductTags tags={tags} />

          {hasAccess ? (
            <Link href={`/libros/${id}/leer`} className={`mt-6 block text-center ${BUTTON_PRIMARY}`}>
              Leer ahora
            </Link>
          ) : (
            <div className="mt-6">
              {book.price !== null ? (
                <AddToCartButton
                  productType="libro"
                  productId={book.id}
                  title={book.title}
                  unitPrice={book.price}
                  image={book.cover_url ?? undefined}
                />
              ) : (
                <WhatsappDeliveryNote
                  label="Consultá el precio por WhatsApp."
                  message={`Hola! Quiero consultar el precio de "${book.title}".`}
                />
              )}

              <div className="mt-8 border-t border-black/12 pt-6">
                <h2 className={`mb-2 ${LABEL}`}>¿Ya tenés un código de acceso?</h2>
                <form action={redeemBookCode} className="flex gap-2">
                  <input type="hidden" name="bookId" value={book.id} />
                  <input
                    type="text"
                    name="code"
                    placeholder="XXXX-XXXX"
                    className="flex-1 rounded-sm border border-black/15 px-3 py-2 text-sm uppercase"
                  />
                  <button type="submit" className={BUTTON_OUTLINE}>
                    Canjear
                  </button>
                </form>
                {codeError && <p className="mt-2 text-sm text-red-600">{codeError}</p>}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
