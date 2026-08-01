"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { generateAccessCode } from "@/lib/codes";
import { sendBookAccessCodeEmail } from "@/lib/email";

/** Un precio marcado "a consultar" en el form se guarda como NULL. */
function readPrice(formData: FormData, field: string): number | null {
  if (formData.get(`${field}_on_request`) === "on") return null;
  return Number(formData.get(field)) || 0;
}

type OrderableTable = "books" | "servicios" | "packs" | "portfolio" | "testimonios" | "faqs";

/** Los productos nuevos se agregan arriba de todo, adelante del orden manual existente. */
async function topSortOrder(table: OrderableTable): Promise<number> {
  const supabase = await createClient();
  const { data } = await supabase
    .from(table)
    .select("sort_order")
    .order("sort_order", { ascending: true })
    .limit(1)
    .maybeSingle();
  return (data?.sort_order ?? 0) - 1;
}

/** Aplica el orden completo (drag-and-drop) reasignando sort_order según la posición. */
async function reorderTable(table: OrderableTable, orderedIds: string[]) {
  const supabase = await createClient();
  await Promise.all(
    orderedIds.map((id, index) => supabase.from(table).update({ sort_order: index + 1 }).eq("id", id))
  );
}

export async function createBook(formData: FormData) {
  const supabase = await createClient();
  const { error } = await supabase.from("books").insert({
    title: String(formData.get("title")),
    author: String(formData.get("author") || "") || null,
    description: String(formData.get("description") || "") || null,
    price: readPrice(formData, "price"),
    cover_url: String(formData.get("cover_url") || "") || null,
    file_path: String(formData.get("file_path") || "") || null,
    sort_order: await topSortOrder("books"),
  });
  if (error) throw new Error(error.message);
  revalidatePath("/admin/libros");
}

export async function reorderBooks(orderedIds: string[]) {
  await reorderTable("books", orderedIds);
  revalidatePath("/admin/libros");
}

export async function toggleBookActive(id: string, isActive: boolean) {
  const supabase = await createClient();
  await supabase.from("books").update({ is_active: isActive }).eq("id", id);
  revalidatePath("/admin/libros");
}

export async function deleteBook(id: string) {
  const admin = createAdminClient();
  await admin.from("books").delete().eq("id", id);
  revalidatePath("/admin/libros");
}

export async function updateBook(id: string, formData: FormData) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("books")
    .update({
      title: String(formData.get("title")),
      author: String(formData.get("author") || "") || null,
      description: String(formData.get("description") || "") || null,
      price: readPrice(formData, "price"),
      cover_url: String(formData.get("cover_url") || "") || null,
      file_path: String(formData.get("file_path") || "") || null,
    })
    .eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/libros");
}

export async function createCurso(formData: FormData) {
  const supabase = await createClient();
  const imageUrls = String(formData.get("image_urls") || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  const { error } = await supabase.from("cursos").insert({
    name: String(formData.get("name")),
    description: String(formData.get("description") || "") || null,
    price: readPrice(formData, "price"),
    duration: String(formData.get("duration") || "") || null,
    start_date: String(formData.get("start_date") || "") || null,
    start_time: String(formData.get("start_time") || "") || null,
    image_urls: imageUrls,
  });
  if (error) throw new Error(error.message);
  revalidatePath("/admin/cursos");
}

export async function toggleCursoActive(id: string, isActive: boolean) {
  const supabase = await createClient();
  await supabase.from("cursos").update({ is_active: isActive }).eq("id", id);
  revalidatePath("/admin/cursos");
}

export async function deleteCurso(id: string) {
  const admin = createAdminClient();
  await admin.from("cursos").delete().eq("id", id);
  revalidatePath("/admin/cursos");
}

export async function updateCurso(id: string, formData: FormData) {
  const supabase = await createClient();
  const imageUrls = String(formData.get("image_urls") || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  const { error } = await supabase
    .from("cursos")
    .update({
      name: String(formData.get("name")),
      description: String(formData.get("description") || "") || null,
      price: readPrice(formData, "price"),
      duration: String(formData.get("duration") || "") || null,
      start_date: String(formData.get("start_date") || "") || null,
      start_time: String(formData.get("start_time") || "") || null,
      image_urls: imageUrls,
    })
    .eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/cursos");
}

export async function createServicio(formData: FormData) {
  const supabase = await createClient();
  const imageUrls = String(formData.get("image_urls") || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  const { error } = await supabase.from("servicios").insert({
    name: String(formData.get("name")),
    description: String(formData.get("description") || "") || null,
    price: readPrice(formData, "price"),
    modalidad: String(formData.get("modalidad") || "ambas") as "online" | "presencial" | "ambas",
    image_urls: imageUrls,
    sort_order: await topSortOrder("servicios"),
  });
  if (error) throw new Error(error.message);
  revalidatePath("/admin/servicios");
  revalidatePath("/servicios");
}

export async function reorderServicios(orderedIds: string[]) {
  await reorderTable("servicios", orderedIds);
  revalidatePath("/admin/servicios");
}

export async function toggleServicioActive(id: string, isActive: boolean) {
  const supabase = await createClient();
  await supabase.from("servicios").update({ is_active: isActive }).eq("id", id);
  revalidatePath("/admin/servicios");
  revalidatePath("/servicios");
}

export async function deleteServicio(id: string) {
  const admin = createAdminClient();
  await admin.from("servicios").delete().eq("id", id);
  revalidatePath("/admin/servicios");
  revalidatePath("/servicios");
}

export async function updateServicio(id: string, formData: FormData) {
  const supabase = await createClient();
  const imageUrls = String(formData.get("image_urls") || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  const { error } = await supabase
    .from("servicios")
    .update({
      name: String(formData.get("name")),
      description: String(formData.get("description") || "") || null,
      price: readPrice(formData, "price"),
      modalidad: String(formData.get("modalidad") || "ambas") as "online" | "presencial" | "ambas",
      image_urls: imageUrls,
    })
    .eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/servicios");
  revalidatePath("/servicios");
}

export async function createPack(formData: FormData) {
  const supabase = await createClient();
  const imageUrls = String(formData.get("image_urls") || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  const { error } = await supabase.from("packs").insert({
    name: String(formData.get("name")),
    description: String(formData.get("description") || "") || null,
    price: readPrice(formData, "price"),
    sessions_count: Number(formData.get("sessions_count")) || null,
    image_urls: imageUrls,
    sort_order: await topSortOrder("packs"),
  });
  if (error) throw new Error(error.message);
  revalidatePath("/admin/packs");
  revalidatePath("/packs");
}

export async function reorderPacks(orderedIds: string[]) {
  await reorderTable("packs", orderedIds);
  revalidatePath("/admin/packs");
}

export async function togglePackActive(id: string, isActive: boolean) {
  const supabase = await createClient();
  await supabase.from("packs").update({ is_active: isActive }).eq("id", id);
  revalidatePath("/admin/packs");
  revalidatePath("/packs");
}

export async function deletePack(id: string) {
  const admin = createAdminClient();
  await admin.from("packs").delete().eq("id", id);
  revalidatePath("/admin/packs");
  revalidatePath("/packs");
}

export async function updatePack(id: string, formData: FormData) {
  const supabase = await createClient();
  const imageUrls = String(formData.get("image_urls") || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  const { error } = await supabase
    .from("packs")
    .update({
      name: String(formData.get("name")),
      description: String(formData.get("description") || "") || null,
      price: readPrice(formData, "price"),
      sessions_count: Number(formData.get("sessions_count")) || null,
      image_urls: imageUrls,
    })
    .eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/packs");
  revalidatePath("/packs");
}

export async function createPortfolioItem(formData: FormData) {
  const supabase = await createClient();
  const { error } = await supabase.from("portfolio").insert({
    title: String(formData.get("title") || "") || null,
    description: String(formData.get("description") || "") || null,
    image_url: String(formData.get("image_url") || "") || null,
    before_image_url: String(formData.get("before_image_url") || "") || null,
    after_image_url: String(formData.get("after_image_url") || "") || null,
    sort_order: await topSortOrder("portfolio"),
  });
  if (error) throw new Error(error.message);
  revalidatePath("/admin/portfolio");
  revalidatePath("/portfolio");
}

export async function reorderPortfolio(orderedIds: string[]) {
  await reorderTable("portfolio", orderedIds);
  revalidatePath("/admin/portfolio");
}

export async function togglePortfolioActive(id: string, isActive: boolean) {
  const supabase = await createClient();
  await supabase.from("portfolio").update({ is_active: isActive }).eq("id", id);
  revalidatePath("/admin/portfolio");
  revalidatePath("/portfolio");
}

export async function deletePortfolioItem(id: string) {
  const admin = createAdminClient();
  await admin.from("portfolio").delete().eq("id", id);
  revalidatePath("/admin/portfolio");
  revalidatePath("/portfolio");
}

export async function updatePortfolioItem(id: string, formData: FormData) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("portfolio")
    .update({
      title: String(formData.get("title") || "") || null,
      description: String(formData.get("description") || "") || null,
      image_url: String(formData.get("image_url") || "") || null,
      before_image_url: String(formData.get("before_image_url") || "") || null,
      after_image_url: String(formData.get("after_image_url") || "") || null,
    })
    .eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/portfolio");
  revalidatePath("/portfolio");
}

export async function createTestimonio(formData: FormData) {
  const supabase = await createClient();
  const { error } = await supabase.from("testimonios").insert({
    client_name: String(formData.get("client_name")),
    quote: String(formData.get("quote")),
    photo_url: String(formData.get("photo_url") || "") || null,
    rating: Number(formData.get("rating")) || null,
    sort_order: await topSortOrder("testimonios"),
  });
  if (error) throw new Error(error.message);
  revalidatePath("/admin/testimonios");
  revalidatePath("/");
}

export async function reorderTestimonios(orderedIds: string[]) {
  await reorderTable("testimonios", orderedIds);
  revalidatePath("/admin/testimonios");
}

export async function toggleTestimonioActive(id: string, isActive: boolean) {
  const supabase = await createClient();
  await supabase.from("testimonios").update({ is_active: isActive }).eq("id", id);
  revalidatePath("/admin/testimonios");
  revalidatePath("/");
}

export async function deleteTestimonio(id: string) {
  const admin = createAdminClient();
  await admin.from("testimonios").delete().eq("id", id);
  revalidatePath("/admin/testimonios");
  revalidatePath("/");
}

export async function updateTestimonio(id: string, formData: FormData) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("testimonios")
    .update({
      client_name: String(formData.get("client_name")),
      quote: String(formData.get("quote")),
      photo_url: String(formData.get("photo_url") || "") || null,
      rating: Number(formData.get("rating")) || null,
    })
    .eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/testimonios");
  revalidatePath("/");
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export async function createBlogPost(formData: FormData) {
  const supabase = await createClient();
  const title = String(formData.get("title"));
  const { error } = await supabase.from("blog_posts").insert({
    title,
    slug: slugify(String(formData.get("slug") || "") || title),
    excerpt: String(formData.get("excerpt") || "") || null,
    content: String(formData.get("content") || ""),
    cover_url: String(formData.get("cover_url") || "") || null,
  });
  if (error) throw new Error(error.message);
  revalidatePath("/admin/blog");
  revalidatePath("/blog");
}

export async function toggleBlogPostActive(id: string, isActive: boolean) {
  const supabase = await createClient();
  await supabase.from("blog_posts").update({ is_active: isActive }).eq("id", id);
  revalidatePath("/admin/blog");
  revalidatePath("/blog");
}

export async function deleteBlogPost(id: string) {
  const admin = createAdminClient();
  await admin.from("blog_posts").delete().eq("id", id);
  revalidatePath("/admin/blog");
  revalidatePath("/blog");
}

export async function updateBlogPost(id: string, formData: FormData) {
  const supabase = await createClient();
  const title = String(formData.get("title"));
  const { error } = await supabase
    .from("blog_posts")
    .update({
      title,
      slug: slugify(String(formData.get("slug") || "") || title),
      excerpt: String(formData.get("excerpt") || "") || null,
      content: String(formData.get("content") || ""),
      cover_url: String(formData.get("cover_url") || "") || null,
    })
    .eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/blog");
  revalidatePath("/blog");
}

export async function createFaq(formData: FormData) {
  const supabase = await createClient();
  const { error } = await supabase.from("faqs").insert({
    question: String(formData.get("question")),
    answer: String(formData.get("answer")),
    sort_order: await topSortOrder("faqs"),
  });
  if (error) throw new Error(error.message);
  revalidatePath("/admin/faq");
  revalidatePath("/faq");
}

export async function reorderFaqs(orderedIds: string[]) {
  await reorderTable("faqs", orderedIds);
  revalidatePath("/admin/faq");
}

export async function toggleFaqActive(id: string, isActive: boolean) {
  const supabase = await createClient();
  await supabase.from("faqs").update({ is_active: isActive }).eq("id", id);
  revalidatePath("/admin/faq");
  revalidatePath("/faq");
}

export async function deleteFaq(id: string) {
  const admin = createAdminClient();
  await admin.from("faqs").delete().eq("id", id);
  revalidatePath("/admin/faq");
  revalidatePath("/faq");
}

export async function updateFaq(id: string, formData: FormData) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("faqs")
    .update({
      question: String(formData.get("question")),
      answer: String(formData.get("answer")),
    })
    .eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/faq");
  revalidatePath("/faq");
}

export async function createDisponibilidad(formData: FormData) {
  const weekdays = formData.getAll("weekday").map(Number);
  if (weekdays.length === 0) throw new Error("Elegí al menos un día.");

  const start_time = String(formData.get("start_time"));
  const end_time = String(formData.get("end_time"));

  const supabase = await createClient();
  const { error } = await supabase
    .from("disponibilidad_semanal")
    .insert(weekdays.map((weekday) => ({ weekday, start_time, end_time })));
  if (error) throw new Error(error.message);
  revalidatePath("/admin/agenda");
}

export async function toggleDisponibilidadActive(id: string, isActive: boolean) {
  const supabase = await createClient();
  await supabase.from("disponibilidad_semanal").update({ is_active: isActive }).eq("id", id);
  revalidatePath("/admin/agenda");
}

export async function deleteDisponibilidad(id: string) {
  const admin = createAdminClient();
  await admin.from("disponibilidad_semanal").delete().eq("id", id);
  revalidatePath("/admin/agenda");
}

export async function createBloqueo(formData: FormData) {
  const supabase = await createClient();
  const { error } = await supabase.from("bloqueos_fecha").insert({
    start_at: String(formData.get("start_at")),
    end_at: String(formData.get("end_at")),
    reason: String(formData.get("reason") || "") || null,
  });
  if (error) throw new Error(error.message);
  revalidatePath("/admin/agenda");
}

export async function deleteBloqueo(id: string) {
  const admin = createAdminClient();
  await admin.from("bloqueos_fecha").delete().eq("id", id);
  revalidatePath("/admin/agenda");
}

export async function cancelTurno(id: string) {
  const supabase = await createClient();
  await supabase.from("turnos").update({ status: "cancelado" }).eq("id", id);
  revalidatePath("/admin/agenda");
}

export async function createDiscountCode(formData: FormData) {
  const supabase = await createClient();
  const type = String(formData.get("discount_type") || "percent");
  const value = Number(formData.get("discount_value")) || 0;

  await supabase.from("discount_codes").insert({
    code: String(formData.get("code")).trim().toUpperCase(),
    percent_off: type === "percent" ? value : null,
    amount_off: type === "amount" ? value : null,
  });
  revalidatePath("/admin/cupones");
}

export async function toggleDiscountCodeActive(id: string, isActive: boolean) {
  const supabase = await createClient();
  await supabase.from("discount_codes").update({ is_active: isActive }).eq("id", id);
  revalidatePath("/admin/cupones");
}

export async function deleteDiscountCode(id: string) {
  const admin = createAdminClient();
  await admin.from("discount_codes").delete().eq("id", id);
  revalidatePath("/admin/cupones");
}

export async function toggleUserAdmin(id: string, isAdmin: boolean) {
  const admin = createAdminClient();
  await admin.from("profiles").update({ is_admin: isAdmin }).eq("id", id);
  revalidatePath("/admin/usuarios");
}

export async function createManualBookAccessCode(bookId: string, email: string) {
  const admin = createAdminClient();

  const { data: book } = await admin.from("books").select("title").eq("id", bookId).single();
  if (!book) throw new Error("Libro no encontrado.");

  const code = generateAccessCode();
  await admin.from("book_access").insert({
    book_id: bookId,
    code,
    email_sent_to: email || null,
  });

  if (email) {
    await sendBookAccessCodeEmail({ to: email, bookTitle: book.title, code });
  }

  revalidatePath("/admin/libros");
  return code;
}

export async function createBookPromoCode(formData: FormData) {
  const supabase = await createClient();
  const { error } = await supabase.from("book_promo_codes").insert({
    book_id: String(formData.get("book_id")),
    code: String(formData.get("code")).trim().toUpperCase(),
  });
  if (error) throw new Error(error.message);
  revalidatePath("/admin/codigos-libros");
}

export async function toggleBookPromoCodeActive(id: string, isActive: boolean) {
  const supabase = await createClient();
  await supabase.from("book_promo_codes").update({ is_active: isActive }).eq("id", id);
  revalidatePath("/admin/codigos-libros");
}

export async function deleteBookPromoCode(id: string) {
  const admin = createAdminClient();
  await admin.from("book_promo_codes").delete().eq("id", id);
  revalidatePath("/admin/codigos-libros");
}
