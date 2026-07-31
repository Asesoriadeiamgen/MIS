import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { formatDate } from "@/lib/format";
import { truncateDescription, buildSocialMeta, breadcrumbJsonLd, SITE_URL } from "@/lib/seo";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createClient();
  const { data: post } = await supabase.from("blog_posts").select("*").eq("slug", slug).single();
  if (!post) return {};

  const description = truncateDescription(post.excerpt || post.content.replace(/<[^>]+>/g, " "));
  return {
    title: post.title,
    description,
    alternates: { canonical: `/blog/${slug}` },
    ...buildSocialMeta({ title: post.title, description, path: `/blog/${slug}`, image: post.cover_url }),
  };
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: post } = await supabase.from("blog_posts").select("*").eq("slug", slug).single();
  if (!post || !post.is_active) notFound();

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    image: post.cover_url || undefined,
    datePublished: post.published_at,
    url: `${SITE_URL}/blog/${slug}`,
  };
  const breadcrumbs = breadcrumbJsonLd([
    { name: "Inicio", path: "/" },
    { name: "Blog", path: "/blog" },
    { name: post.title, path: `/blog/${slug}` },
  ]);

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbs) }}
      />
      <p className="text-xs text-[#1a1a1a]/50">{formatDate(post.published_at)}</p>
      <h1 className="mt-1 font-serif text-3xl">{post.title}</h1>
      {post.cover_url && (
        <div className="mt-6 aspect-video overflow-hidden rounded-sm bg-soft-bg">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={post.cover_url} alt={post.title} className="h-full w-full object-cover" />
        </div>
      )}
      <div
        className="prose prose-sm mt-6 max-w-none text-[#1a1a1a]/80 [&_a]:underline [&_li]:ml-4 [&_ol]:list-decimal [&_p]:mb-4 [&_ul]:list-disc"
        dangerouslySetInnerHTML={{ __html: post.content }}
      />
    </div>
  );
}
