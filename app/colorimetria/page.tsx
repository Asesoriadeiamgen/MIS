import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { formatDate } from "@/lib/format";
import { buildSocialMeta, SITE_NAME } from "@/lib/seo";
import { sanitizeHtml } from "@/lib/sanitizeHtml";

const title = "Colorimetría";
const description = `Colorimetría y color: artículos de ${SITE_NAME} para elegir tu paleta ideal.`;
const keywords = ["colorimetría", "círculo cromático", "paleta de color", "asesoría de imagen"];

export const metadata: Metadata = {
  title,
  description,
  keywords,
  alternates: { canonical: "/colorimetria" },
  ...buildSocialMeta({ title, description, path: "/colorimetria" }),
};

export default async function ColorimetriaPage() {
  const supabase = await createClient();
  const { data: posts } = await supabase
    .from("colorimetria_posts")
    .select("*")
    .eq("is_active", true)
    .order("published_at", { ascending: false });

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="mb-2 font-serif text-3xl">Colorimetría</h1>
      <p className="mb-8 text-[#1a1a1a]/70">Todo sobre el color y cómo usarlo a tu favor.</p>

      {!posts || posts.length === 0 ? (
        <p className="text-sm text-[#1a1a1a]/50">Todavía no hay artículos publicados.</p>
      ) : (
        <div className="flex flex-col gap-6">
          {posts.map((post) => (
            <Link
              key={post.id}
              href={`/colorimetria/${post.slug}`}
              className="flex gap-4 rounded-sm border border-black/10 bg-white p-4 transition hover:-translate-y-0.5 hover:shadow-sm"
            >
              {post.cover_url && (
                <div className="aspect-square w-24 flex-shrink-0 overflow-hidden rounded-sm bg-soft-bg">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={post.cover_url} alt={post.title} className="h-full w-full object-cover" />
                </div>
              )}
              <div>
                <p className="text-xs text-[#1a1a1a]/50">{formatDate(post.published_at)}</p>
                <h2 className="font-serif text-lg">{post.title}</h2>
                {post.excerpt && (
                  <div
                    className="prose prose-sm mt-1 max-w-none text-sm text-[#1a1a1a]/70 [&_p]:inline"
                    dangerouslySetInnerHTML={{ __html: sanitizeHtml(post.excerpt) }}
                  />
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
