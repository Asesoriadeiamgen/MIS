import { MercadoPagoConfig, Preference, Payment } from "mercadopago";

function getClient() {
  const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;
  if (!accessToken) {
    throw new Error("Falta MERCADOPAGO_ACCESS_TOKEN en las variables de entorno.");
  }
  return new MercadoPagoConfig({ accessToken });
}

export interface PreferenceItemInput {
  id: string;
  title: string;
  quantity: number;
  unit_price: number;
}

export async function createPreference(params: {
  orderId: string;
  items: PreferenceItemInput[];
  payerEmail?: string;
}) {
  const client = getClient();
  const preference = new Preference(client);
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL!;
  // Mercado Pago rechaza auto_return si back_urls.success apunta a localhost
  // (no puede validar la URL). Funciona una vez desplegado con un dominio real.
  const isLocal = siteUrl.includes("localhost") || siteUrl.includes("127.0.0.1");

  const result = await preference.create({
    body: {
      items: params.items.map((item) => ({
        id: item.id,
        title: item.title,
        quantity: item.quantity,
        unit_price: item.unit_price,
        currency_id: "ARS",
      })),
      payer: params.payerEmail ? { email: params.payerEmail } : undefined,
      external_reference: params.orderId,
      back_urls: {
        success: `${siteUrl}/checkout/success`,
        failure: `${siteUrl}/checkout/failure`,
        pending: `${siteUrl}/checkout/pending`,
      },
      ...(isLocal ? {} : { auto_return: "approved" as const }),
      notification_url: `${siteUrl}/api/mercadopago/webhook`,
    },
  });

  return result;
}

export async function getPayment(paymentId: string) {
  const client = getClient();
  const payment = new Payment(client);
  return payment.get({ id: paymentId });
}
