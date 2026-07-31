"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { generateAccessCode } from "@/lib/codes";

export async function redeemBookCode(formData: FormData) {
  const bookId = String(formData.get("bookId"));
  const code = String(formData.get("code") || "").trim().toUpperCase();

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/cuenta/login?next=/libros/${bookId}`);
  }

  if (!code) {
    redirect(`/libros/${bookId}?codeError=${encodeURIComponent("Ingresá un código.")}`);
  }

  const admin = createAdminClient();

  // Código individual: de un solo uso, atado a la primera persona que lo canjea.
  const { data: access } = await admin
    .from("book_access")
    .select("*")
    .eq("book_id", bookId)
    .eq("code", code)
    .maybeSingle();

  if (access) {
    if (access.user_id && access.user_id !== user.id) {
      redirect(`/libros/${bookId}?codeError=${encodeURIComponent("Ese código ya fue utilizado.")}`);
    }
    if (!access.user_id) {
      await admin
        .from("book_access")
        .update({ user_id: user.id, redeemed_at: new Date().toISOString() })
        .eq("id", access.id);
    }
    redirect(`/libros/${bookId}/leer`);
  }

  // Código compartido: lo puede canjear cualquier cantidad de personas, cada
  // una una sola vez. Cada canje exitoso genera un acceso individual nuevo.
  const { data: promo } = await admin
    .from("book_promo_codes")
    .select("id")
    .eq("book_id", bookId)
    .eq("code", code)
    .eq("is_active", true)
    .maybeSingle();

  if (!promo) {
    redirect(`/libros/${bookId}?codeError=${encodeURIComponent("Código inválido.")}`);
  }

  const { data: existingAccess } = await admin
    .from("book_access")
    .select("id")
    .eq("book_id", bookId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (!existingAccess) {
    await admin.from("book_access").insert({
      book_id: bookId,
      user_id: user.id,
      code: generateAccessCode(),
      email_sent_to: user.email ?? null,
      redeemed_at: new Date().toISOString(),
    });
  }

  redirect(`/libros/${bookId}/leer`);
}
