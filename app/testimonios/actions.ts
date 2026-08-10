"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isRateLimited } from "@/lib/rateLimit";

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
  const ratingRaw = Number(formData.get("rating"));
  const rating = ratingRaw >= 1 && ratingRaw <= 5 ? ratingRaw : null;

  if (!clientName || !quote) {
    redirect(`/testimonios/enviar?error=${encodeURIComponent("Completá tu nombre y el testimonio.")}`);
  }

  const admin = createAdminClient();
  const { error } = await admin.from("testimonios").insert({
    client_name: clientName,
    quote: quote.replace(/\n+/g, "<br/>"),
    rating,
    is_active: false,
  });
  if (error) {
    redirect(`/testimonios/enviar?error=${encodeURIComponent("No se pudo enviar. Probá de nuevo.")}`);
  }

  revalidatePath("/admin/testimonios");
  redirect("/testimonios/enviar?sent=1");
}
