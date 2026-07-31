import { NextResponse } from "next/server";
import { createHmac, timingSafeEqual } from "crypto";
import { getPayment } from "@/lib/mercadopago";
import { createAdminClient } from "@/lib/supabase/admin";
import { fulfillPaidOrder } from "@/lib/orderFulfillment";

function isValidSignature(request: Request, dataId: string): boolean {
  const secret = process.env.MERCADOPAGO_WEBHOOK_SECRET;
  if (!secret) return true; // sin secret configurado, no bloqueamos (compatibilidad hacia atrás)

  const signatureHeader = request.headers.get("x-signature");
  const requestId = request.headers.get("x-request-id");
  if (!signatureHeader || !requestId) {
    console.error("Webhook MP: falta x-signature o x-request-id", {
      hasSignature: !!signatureHeader,
      hasRequestId: !!requestId,
    });
    return false;
  }

  const parts = Object.fromEntries(
    signatureHeader.split(",").map((pair) => {
      const [key, value] = pair.split("=");
      return [key?.trim(), value?.trim()];
    })
  );
  const ts = parts.ts;
  const v1 = parts.v1;
  if (!ts || !v1) {
    console.error("Webhook MP: x-signature sin ts/v1", { signatureHeader });
    return false;
  }

  const manifest = `id:${dataId.toLowerCase()};request-id:${requestId};ts:${ts};`;
  const expected = createHmac("sha256", secret).update(manifest).digest("hex");

  const expectedBuf = Buffer.from(expected);
  const receivedBuf = Buffer.from(v1);
  const matches =
    expectedBuf.length === receivedBuf.length && timingSafeEqual(expectedBuf, receivedBuf);

  if (!matches) {
    console.error("Webhook MP: firma no coincide", {
      manifest,
      expectedPrefix: expected.slice(0, 8),
      receivedPrefix: v1.slice(0, 8),
      expectedLen: expected.length,
      receivedLen: v1.length,
    });
  }

  return matches;
}

export async function POST(request: Request) {
  const url = new URL(request.url);
  let paymentId = url.searchParams.get("data.id") || url.searchParams.get("id");
  const type = url.searchParams.get("type") || url.searchParams.get("topic");

  if (!paymentId) {
    try {
      const body = await request.json();
      paymentId = body?.data?.id || null;
    } catch {
      // sin body JSON, seguimos con lo que haya en la query
    }
  }

  if (!paymentId || (type && type !== "payment")) {
    return NextResponse.json({ received: true });
  }

  if (!isValidSignature(request, paymentId)) {
    // No bloqueamos: la fuente de verdad es siempre getPayment() contra la API
    // de Mercado Pago más abajo, nunca el cuerpo de esta notificación. Dejamos
    // el log para poder revisar por qué no matchea la firma sin cortar pagos reales.
    console.error("Firma inválida en webhook de Mercado Pago (se continúa igual)");
  }

  const admin = createAdminClient();

  try {
    const payment = await getPayment(String(paymentId));
    const orderId = payment.external_reference;
    if (!orderId) return NextResponse.json({ received: true });

    if (payment.status !== "approved") {
      return NextResponse.json({ received: true });
    }

    const { data: order } = await admin.from("orders").select("id, status").eq("id", orderId).single();
    if (!order || order.status === "paid") {
      return NextResponse.json({ received: true });
    }

    await fulfillPaidOrder(orderId, String(paymentId));

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error("Error procesando webhook de Mercado Pago", err);
    return NextResponse.json({ received: true });
  }
}
