import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createPreference } from "@/lib/mercadopago";
import { fulfillPaidOrder } from "@/lib/orderFulfillment";
import type { ProductType } from "@/types/database";

interface CartItemInput {
  productType: ProductType;
  productId: string;
  title: string;
  unitPrice: number;
  quantity: number;
  customization?: Record<string, unknown>;
}

// Solo estos tipos son comprables online; "agenda"/"artesania"/"varios" no tienen
// tabla vigente y "servicio" se coordina por WhatsApp, nunca por checkout.
const PRODUCT_TABLES: Partial<Record<ProductType, { table: "books" | "cursos" | "packs"; nameField: string }>> = {
  libro: { table: "books", nameField: "title" },
  curso: { table: "cursos", nameField: "name" },
  pack: { table: "packs", nameField: "name" },
};

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Necesitás iniciar sesión." }, { status: 401 });
  }

  const body = await request.json();
  const cartItems: CartItemInput[] = body.items || [];
  const couponCodeInput: string | undefined = body.couponCode;

  if (!Array.isArray(cartItems) || cartItems.length === 0) {
    return NextResponse.json({ error: "El carrito está vacío." }, { status: 400 });
  }

  // El precio y el título nunca se confían del cliente: se recalculan acá
  // contra la base de datos para cada ítem, así nadie puede pagar menos
  // mandando un unitPrice manipulado en el request.
  const admin = createAdminClient();
  const items: CartItemInput[] = [];
  for (const item of cartItems) {
    const mapping = PRODUCT_TABLES[item.productType];
    if (!mapping) {
      return NextResponse.json({ error: "Producto inválido." }, { status: 400 });
    }
    const { data: product } = await admin.from(mapping.table).select("*").eq("id", item.productId).single();
    const record = product as Record<string, unknown> | null;
    if (!record || !record.is_active || record.price === null || record.price === undefined) {
      return NextResponse.json({ error: "Producto no disponible." }, { status: 400 });
    }
    const quantity = Number.isInteger(item.quantity) && item.quantity > 0 ? item.quantity : 1;
    items.push({
      ...item,
      title: String(record[mapping.nameField]),
      unitPrice: Number(record.price),
      quantity,
    });
  }

  // El descuento se re-valida siempre en el servidor, nunca se confía en lo que mande el cliente.
  const subtotal = items.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0);
  let discountAmount = 0;
  let appliedCouponCode: string | null = null;
  if (couponCodeInput) {
    const { data: coupon } = await admin
      .from("discount_codes")
      .select("code, percent_off, amount_off, is_active")
      .eq("code", couponCodeInput.trim().toUpperCase())
      .maybeSingle();

    if (coupon && coupon.is_active) {
      discountAmount =
        coupon.percent_off != null
          ? subtotal * (coupon.percent_off / 100)
          : Math.min(coupon.amount_off!, subtotal);
      appliedCouponCode = coupon.code;
    }
  }

  const discountRatio = subtotal > 0 ? discountAmount / subtotal : 0;
  const discountedItems = items.map((item) => ({
    ...item,
    unitPrice: Math.round(item.unitPrice * (1 - discountRatio) * 100) / 100,
  }));

  const total = discountedItems.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0);

  const { data: order, error: orderError } = await supabase
    .from("orders")
    .insert({ user_id: user.id, status: "pending", total, coupon_code: appliedCouponCode })
    .select()
    .single();

  if (orderError || !order) {
    return NextResponse.json({ error: "No se pudo crear el pedido." }, { status: 500 });
  }

  const { error: itemsError } = await supabase.from("order_items").insert(
    discountedItems.map((item) => ({
      order_id: order.id,
      product_type: item.productType,
      product_id: item.productId,
      title: item.title,
      quantity: item.quantity,
      unit_price: item.unitPrice,
      customization: item.customization || {},
    }))
  );

  if (itemsError) {
    return NextResponse.json({ error: "No se pudo crear el pedido." }, { status: 500 });
  }

  // Con un cupón de 100% off (o de monto fijo que cubre todo) el total puede
  // quedar en $0. Mercado Pago no acepta preferencias de $0, así que en ese
  // caso confirmamos el pedido directamente, sin pasar por Mercado Pago.
  if (total === 0) {
    await fulfillPaidOrder(order.id, null);
    return NextResponse.json({ free: true });
  }

  try {
    const preference = await createPreference({
      orderId: order.id,
      payerEmail: user.email,
      items: discountedItems.map((item, i) => ({
        id: `${order.id}-${i}`,
        title: item.title,
        quantity: item.quantity,
        unit_price: item.unitPrice,
      })),
    });

    await admin.from("orders").update({ mp_preference_id: preference.id }).eq("id", order.id);

    return NextResponse.json({ initPoint: preference.init_point });
  } catch (err) {
    console.error("Error creando preferencia de Mercado Pago:", err);
    return NextResponse.json(
      { error: "No se pudo conectar con Mercado Pago. Verificá las credenciales configuradas." },
      { status: 500 }
    );
  }
}
