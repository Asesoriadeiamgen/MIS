"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isRateLimited } from "@/lib/rateLimit";
import { sendTestimonioPendingNotificationEmail } from "@/lib/email";

/**
 * Cualquier usuario logueado puede mandar su testimonio, pero queda
 * inactivo (is_active: false) hasta que un admin lo revise y lo active desde
 * /admin/testimonios — nunca se publica solo. Se inserta con el service role
 * porque la policy de escritura de "testimonios" es admin-only.
 */
export async function submitTestimonio(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/cuenta/login?next=/testimonios/enviar");

  if (await isRateLimited(`testimonio:${user.id}`, 3, 24 * 60)) {
    redirect(
      `/testimonios/enviar?error=${encodeURIComponent("Ya enviaste varios testimonios hoy. Probá de nuevo mañana.")}`
    );
  }

  const clientName = String(formData.get("client_name") || "").trim();
  const quote = String(formData.get("quote") || "").trim();
  const productOrService = String(formData.get("product_or_service") || "").trim();
  const purchaseMonth = String(formData.get("purchase_month") || "").trim();
  const ratingRaw = Number(formData.get("rating"));
  const rating = ratingRaw >= 1 && ratingRaw <= 5 ? ratingRaw : null;

  if (!clientName || !quote || !productOrService || !purchaseMonth) {
    redirect(`/testimonios/enviar?error=${encodeURIComponent("Completá todos los campos.")}`);
  }

  const admin = createAdminClient();
  const { error } = await admin.from("testimonios").insert({
    client_name: clientName,
    quote: quote.replace(/\n+/g, "<br/>"),
    rating,
    product_or_service: productOrService,
    purchase_month: purchaseMonth,
    is_active: false,
  });
  if (error) {
    redirect(`/testimonios/enviar?error=${encodeURIComponent("No se pudo enviar. Probá de nuevo.")}`);
  }

  // El testimonio ya quedó guardado; si el aviso por mail falla, no debe
  // impedir que el usuario vea la confirmación de envío.
  try {
    await sendTestimonioPendingNotificationEmail({ clientName, quote, rating });
  } catch (err) {
    console.error("No se pudo enviar el aviso de nuevo testimonio", err);
  }

  revalidatePath("/admin/testimonios");
  redirect("/testimonios/enviar?sent=1");
}
