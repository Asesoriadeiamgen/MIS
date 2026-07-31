import { createAdminClient } from "@/lib/supabase/admin";
import { generateAccessCode } from "@/lib/codes";
import {
  sendBookAccessCodeEmail,
  sendOrderConfirmationEmail,
  sendCustomizationEmail,
  sendAdminOrderNotificationEmail,
  ADMIN_EMAIL,
} from "@/lib/email";

const CUSTOMIZATION_PHOTO_BUCKETS: Record<string, string> = {
  agenda: "agenda-photos",
  artesania: "artesania-photos",
};

/**
 * Marca un pedido como pagado y dispara todo lo que depende de eso: códigos de
 * acceso a libros, email de confirmación al comprador, y aviso al admin con los
 * datos de personalización de agendas/artesanías (si hay). La usan tanto el
 * webhook de Mercado Pago como el checkout gratuito (cupón 100% off).
 */
export async function fulfillPaidOrder(orderId: string, paymentId: string | null) {
  const admin = createAdminClient();

  const { data: order } = await admin.from("orders").select("*").eq("id", orderId).single();
  if (!order || order.status === "paid") return;

  await admin
    .from("orders")
    .update({ status: "paid", mp_payment_id: paymentId })
    .eq("id", orderId);

  const { data: profile } = await admin
    .from("profiles")
    .select("email")
    .eq("id", order.user_id)
    .single();

  const { data: items } = await admin.from("order_items").select("*").eq("order_id", orderId);
  const bookItems = (items || []).filter((i) => i.product_type === "libro");
  const customizableItems = (items || []).filter((i) => i.product_type in CUSTOMIZATION_PHOTO_BUCKETS);

  if (profile?.email && bookItems.length > 0) {
    for (const item of bookItems) {
      const code = generateAccessCode();
      await admin.from("book_access").insert({
        book_id: item.product_id,
        user_id: order.user_id,
        order_id: order.id,
        code,
        email_sent_to: profile.email,
        redeemed_at: new Date().toISOString(),
      });
      await sendBookAccessCodeEmail({ to: profile.email, bookTitle: item.title, code });
    }
  }

  if (profile?.email) {
    await sendOrderConfirmationEmail({ to: profile.email, orderId: order.id, total: order.total });
  }

  await sendAdminOrderNotificationEmail({
    orderId: order.id,
    customerEmail: profile?.email || "sin email",
    total: order.total,
    items: (items || []).map((i) => ({
      title: i.title,
      quantity: i.quantity,
      unit_price: i.unit_price,
    })),
  });

  if (customizableItems.length > 0) {
    for (const item of customizableItems) {
      const customization = (item.customization || {}) as Record<string, unknown>;
      if (Object.keys(customization).length === 0) continue;

      const fotos = Array.isArray(customization.fotos) ? (customization.fotos as string[]) : [];
      const bucket = CUSTOMIZATION_PHOTO_BUCKETS[item.product_type];
      const photoLinks: string[] = [];
      for (const path of fotos) {
        if (typeof path !== "string") continue;
        const { data: signed } = await admin.storage
          .from(bucket)
          .createSignedUrl(path, 60 * 60 * 24 * 30);
        if (signed) photoLinks.push(signed.signedUrl);
      }

      await sendCustomizationEmail({
        to: ADMIN_EMAIL,
        orderId: order.id,
        itemTitle: item.title,
        customization,
        photoLinks,
      });
    }
  }
}
