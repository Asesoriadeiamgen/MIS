"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { generateAccessCode } from "@/lib/codes";
import { sendBookAccessCodeEmail } from "@/lib/email";
import { firstImageUrl } from "@/lib/media";

/** Un precio marcado "a consultar" en el form se guarda como NULL. */
function readPrice(formData: FormData, field: string): number | null {
  if (formData.get(`${field}_on_request`) === "on") return null;
  return Number(formData.get(field)) || 0;
}

type OrderableTable = "books" | "agendas" | "artesanias";

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

export async function createAgenda(formData: FormData) {
  const supabase = await createClient();
  const imageUrls = String(formData.get("image_urls") || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  const { error } = await supabase.from("agendas").insert({
    name: String(formData.get("name")),
    description: String(formData.get("description") || "") || null,
    base_price: readPrice(formData, "base_price"),
    cover_url: firstImageUrl(imageUrls),
    image_urls: imageUrls,
    sort_order: await topSortOrder("agendas"),
  });
  if (error) throw new Error(error.message);
  revalidatePath("/admin/agendas");
}

export async function reorderAgendas(orderedIds: string[]) {
  await reorderTable("agendas", orderedIds);
  revalidatePath("/admin/agendas");
}

export async function toggleAgendaActive(id: string, isActive: boolean) {
  const supabase = await createClient();
  await supabase.from("agendas").update({ is_active: isActive }).eq("id", id);
  revalidatePath("/admin/agendas");
}

export async function deleteAgenda(id: string) {
  const admin = createAdminClient();
  await admin.from("agendas").delete().eq("id", id);
  revalidatePath("/admin/agendas");
}

export async function updateAgenda(id: string, formData: FormData) {
  const supabase = await createClient();
  const imageUrls = String(formData.get("image_urls") || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  const { error } = await supabase
    .from("agendas")
    .update({
      name: String(formData.get("name")),
      description: String(formData.get("description") || "") || null,
      base_price: readPrice(formData, "base_price"),
      cover_url: firstImageUrl(imageUrls),
      image_urls: imageUrls,
    })
    .eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/agendas");
}

export async function createArtesania(formData: FormData) {
  const supabase = await createClient();
  const imageUrls = String(formData.get("image_urls") || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  const { error } = await supabase.from("artesanias").insert({
    name: String(formData.get("name")),
    description: String(formData.get("description") || "") || null,
    price: readPrice(formData, "price"),
    image_urls: imageUrls,
    sort_order: await topSortOrder("artesanias"),
  });
  if (error) throw new Error(error.message);
  revalidatePath("/admin/artesanias");
}

export async function reorderArtesanias(orderedIds: string[]) {
  await reorderTable("artesanias", orderedIds);
  revalidatePath("/admin/artesanias");
}

export async function toggleArtesaniaActive(id: string, isActive: boolean) {
  const supabase = await createClient();
  await supabase.from("artesanias").update({ is_active: isActive }).eq("id", id);
  revalidatePath("/admin/artesanias");
}

export async function deleteArtesania(id: string) {
  const admin = createAdminClient();
  await admin.from("artesanias").delete().eq("id", id);
  revalidatePath("/admin/artesanias");
}

export async function updateArtesania(id: string, formData: FormData) {
  const supabase = await createClient();
  const imageUrls = String(formData.get("image_urls") || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  const { error } = await supabase
    .from("artesanias")
    .update({
      name: String(formData.get("name")),
      description: String(formData.get("description") || "") || null,
      price: readPrice(formData, "price"),
      image_urls: imageUrls,
    })
    .eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/artesanias");
}

export async function createVariosProduct(formData: FormData) {
  const supabase = await createClient();
  const { error } = await supabase.from("varios_products").insert({
    name: String(formData.get("name")),
    description: String(formData.get("description") || "") || null,
    price: readPrice(formData, "price"),
    image_url: String(formData.get("image_url") || "") || null,
  });
  if (error) throw new Error(error.message);
  revalidatePath("/admin/varios");
}

export async function toggleVariosActive(id: string, isActive: boolean) {
  const supabase = await createClient();
  await supabase.from("varios_products").update({ is_active: isActive }).eq("id", id);
  revalidatePath("/admin/varios");
}

export async function deleteVariosProduct(id: string) {
  const admin = createAdminClient();
  await admin.from("varios_products").delete().eq("id", id);
  revalidatePath("/admin/varios");
}

export async function updateVariosProduct(id: string, formData: FormData) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("varios_products")
    .update({
      name: String(formData.get("name")),
      description: String(formData.get("description") || "") || null,
      price: readPrice(formData, "price"),
      image_url: String(formData.get("image_url") || "") || null,
    })
    .eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/varios");
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
