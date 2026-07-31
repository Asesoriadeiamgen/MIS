import type { MetadataRoute } from "next";
import { createAdminClient } from "@/lib/supabase/admin";
import { SITE_URL } from "@/lib/seo";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const admin = createAdminClient();

  const [
    { data: books },
    { data: cursos },
    { data: servicios },
    { data: packs },
    { data: blogPosts },
  ] = await Promise.all([
    admin.from("books").select("id, created_at").eq("is_active", true),
    admin.from("cursos").select("id, created_at").eq("is_active", true),
    admin.from("servicios").select("id, created_at").eq("is_active", true),
    admin.from("packs").select("id, created_at").eq("is_active", true),
    admin.from("blog_posts").select("slug, published_at").eq("is_active", true),
  ]);

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, changeFrequency: "weekly", priority: 1 },
    { url: `${SITE_URL}/sobre-mi`, changeFrequency: "monthly", priority: 0.7 },
    { url: `${SITE_URL}/servicios`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${SITE_URL}/packs`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${SITE_URL}/portfolio`, changeFrequency: "weekly", priority: 0.7 },
    { url: `${SITE_URL}/blog`, changeFrequency: "weekly", priority: 0.7 },
    { url: `${SITE_URL}/tienda`, changeFrequency: "weekly", priority: 0.7 },
    { url: `${SITE_URL}/libros`, changeFrequency: "weekly", priority: 0.6 },
    { url: `${SITE_URL}/cursos`, changeFrequency: "weekly", priority: 0.6 },
    { url: `${SITE_URL}/faq`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${SITE_URL}/agenda`, changeFrequency: "monthly", priority: 0.7 },
  ];

  const productRoutes: MetadataRoute.Sitemap = [
    ...(books || []).map((b) => ({
      url: `${SITE_URL}/libros/${b.id}`,
      lastModified: b.created_at,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
    ...(cursos || []).map((c) => ({
      url: `${SITE_URL}/cursos/${c.id}`,
      lastModified: c.created_at,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
    ...(servicios || []).map((s) => ({
      url: `${SITE_URL}/servicios/${s.id}`,
      lastModified: s.created_at,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
    ...(packs || []).map((p) => ({
      url: `${SITE_URL}/packs/${p.id}`,
      lastModified: p.created_at,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
    ...(blogPosts || []).map((post) => ({
      url: `${SITE_URL}/blog/${post.slug}`,
      lastModified: post.published_at,
      changeFrequency: "monthly" as const,
      priority: 0.5,
    })),
  ];

  return [...staticRoutes, ...productRoutes];
}
