import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { formatDate } from "@/lib/format";
import { buildSocialMeta, SITE_NAME } from "@/lib/seo";
import { sanitizeHtml } from "@/lib/sanitizeHtml";

const title = "Blog";
const description = `Tendencias, tips y errores comunes sobre imagen personal, por ${SITE_NAME}.`;

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/blog" },
  ...buildSocialMeta({ title, description, path: "/blog" }),
};

export default async function BlogPage() {
  const supabase = await createClient();
  const { data: posts } = await supabase
    .from("blog_posts")
    .select("*")
    .eq("is_active", true)
    .order("published_at", { ascending: false });

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="mb-2 font-serif text-3xl">Blog</h1>
      <p className="mb-8 text-[#1a1a1a]/70">Tendencias, tips y errores comunes.</p>

      {!posts || posts.length === 0 ? (
        <p className="text-sm text-[#1a1a1a]/50">Todavía no hay notas publicadas.</p>
      ) : (
        <div className="flex flex-col gap-6">
          {posts.map((post) => (
            <Link
              key={post.id}
              href={`/blog/${post.slug}`}
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
