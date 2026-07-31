import type { MetadataRoute } from "next";
import { createAdminClient } from "@/lib/supabase/admin";
import { SITE_URL } from "@/lib/seo";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const admin = createAdminClient();

  const [{ data: books }, { data: agendas }, { data: artesanias }, { data: varios }, { data: cursos }] =
    await Promise.all([
      admin.from("books").select("id, created_at").eq("is_active", true),
      admin.from("agendas").select("id, created_at").eq("is_active", true),
      admin.from("artesanias").select("id, created_at").eq("is_active", true),
      admin.from("varios_products").select("id, created_at").eq("is_active", true),
      admin.from("cursos").select("id, created_at").eq("is_active", true),
    ]);

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, changeFrequency: "weekly", priority: 1 },
    { url: `${SITE_URL}/libros`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${SITE_URL}/agendas`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${SITE_URL}/artesanias`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${SITE_URL}/varios`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${SITE_URL}/cursos`, changeFrequency: "weekly", priority: 0.8 },
  ];

  const productRoutes: MetadataRoute.Sitemap = [
    ...(books || []).map((b) => ({
      url: `${SITE_URL}/libros/${b.id}`,
      lastModified: b.created_at,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
    ...(agendas || []).map((a) => ({
      url: `${SITE_URL}/agendas/${a.id}`,
      lastModified: a.created_at,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
    ...(artesanias || []).map((a) => ({
      url: `${SITE_URL}/artesanias/${a.id}`,
      lastModified: a.created_at,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
    ...(varios || []).map((v) => ({
      url: `${SITE_URL}/varios/${v.id}`,
      lastModified: v.created_at,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
    ...(cursos || []).map((c) => ({
      url: `${SITE_URL}/cursos/${c.id}`,
      lastModified: c.created_at,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
  ];

  return [...staticRoutes, ...productRoutes];
}
