"use client";

import { useState } from "react";
import Link from "next/link";
import { useCartStore, cartTotal, useCartHydrated } from "@/lib/cart-store";
import { formatPrice } from "@/lib/format";
import { BUTTON_PRIMARY, BUTTON_OUTLINE, LABEL } from "@/lib/ui";

function summarizeCustomization(c?: Record<string, unknown>): string | null {
  if (!c) return null;
  const parts: string[] = [];
  for (const [key, value] of Object.entries(c)) {
    if (value === undefined || value === null || value === "") continue;
    if (Array.isArray(value)) {
      if (key === "fotos" && value.length > 0) parts.push(`${value.length} foto(s)`);
      continue;
    }
    parts.push(`${key}: ${value}`);
  }
  return parts.length ? parts.join(" · ") : null;
}

export default function CartView(props: { userEmail: string | null }) {
  const items = useCartStore((s) => s.items);
  const removeItem = useCartStore((s) => s.removeItem);
  const setQuantity = useCartStore((s) => s.setQuantity);
  const mounted = useCartHydrated();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [couponInput, setCouponInput] = useState("");
  const [coupon, setCoupon] = useState<{
    code: string;
    percentOff: number | null;
    amountOff: number | null;
  } | null>(null);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [couponLoading, setCouponLoading] = useState(false);

  async function handleApplyCoupon() {
    setCouponError(null);
    if (!couponInput.trim()) return;
    setCouponLoading(true);
    try {
      const res = await fetch("/api/coupon/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: couponInput }),
      });
      const data = await res.json();
      if (!res.ok || !data.valid) {
        setCoupon(null);
        setCouponError(data.error || "Código inválido.");
      } else {
        setCoupon({ code: data.code, percentOff: data.percentOff, amountOff: data.amountOff });
      }
    } catch {
      setCoupon(null);
      setCouponError("No se pudo validar el código. Probá de nuevo.");
    } finally {
      setCouponLoading(false);
    }
  }

  async function handleCheckout() {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items, couponCode: coupon?.code }),
      });
      const data = await res.json();
      if (!res.ok || (!data.initPoint && !data.free)) {
        setError(data.error || "No se pudo iniciar el pago. Probá de nuevo.");
        setLoading(false);
        return;
      }
      window.location.href = data.free ? "/checkout/success" : data.initPoint;
    } catch {
      setError("No se pudo iniciar el pago. Probá de nuevo.");
      setLoading(false);
    }
  }

  if (!mounted) return null;

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20 text-center">
        <h1 className="mb-3 font-serif text-3xl">Tu carrito está vacío</h1>
        <Link href="/" className="underline">
          Volver a la tienda
        </Link>
      </div>
    );
  }

  const subtotal = cartTotal(items);
  const discount = coupon
    ? coupon.percentOff != null
      ? Math.round(subtotal * (coupon.percentOff / 100) * 100) / 100
      : Math.min(coupon.amountOff!, subtotal)
    : 0;
  const total = subtotal - discount;
  const couponLabel = coupon
    ? coupon.percentOff != null
      ? `${coupon.percentOff}% off`
      : `${formatPrice(coupon.amountOff!)} off`
    : "";

  return (
    <div className="mx-auto max-w-3xl px-4 py-16">
      <h1 className="mb-10 font-serif text-3xl">Tu carrito</h1>

      <ul className="flex flex-col gap-4">
        {items.map((item) => {
          const summary = summarizeCustomization(item.customization);
          return (
            <li key={item.lineId} className="flex gap-4 rounded-sm border border-black/12 p-4">
              <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-sm bg-soft-bg-deep">
                {item.image && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={item.image} alt={item.title} className="h-full w-full object-cover" />
                )}
              </div>
              <div className="flex-1">
                <p className="font-medium">{item.title}</p>
                {summary && <p className="text-xs text-[#1a1a1a]/50">{summary}</p>}
                <p className="mt-1 text-sm font-semibold">{formatPrice(item.unitPrice)}</p>
                <div className="mt-2 flex items-center gap-2">
                  <label className={LABEL}>Cantidad</label>
                  <input
                    type="number"
                    min={1}
                    value={item.quantity}
                    onChange={(e) => setQuantity(item.lineId, Number(e.target.value))}
                    className="w-16 rounded-sm border border-black/15 px-2 py-1 text-sm"
                  />
                  <button
                    onClick={() => removeItem(item.lineId)}
                    className="ml-4 text-xs uppercase tracking-widest text-red-700/80 underline"
                  >
                    Quitar
                  </button>
                </div>
              </div>
            </li>
          );
        })}
      </ul>

      <div className="mt-8 border-t border-black/12 pt-6">
        <label className={`mb-1.5 block ${LABEL}`}>¿Tenés un cupón de descuento?</label>
        <div className="flex gap-2">
          <input
            type="text"
            value={couponInput}
            onChange={(e) => setCouponInput(e.target.value)}
            placeholder="CODIGO"
            className="flex-1 rounded-sm border border-black/15 px-3 py-2 text-sm uppercase"
          />
          <button onClick={handleApplyCoupon} disabled={couponLoading} className={BUTTON_OUTLINE}>
            {couponLoading ? "Validando..." : "Aplicar"}
          </button>
        </div>
        {couponError && <p className="mt-2 text-sm text-red-600">{couponError}</p>}
        {coupon && (
          <p className="mt-2 text-sm text-green-700">
            Cupón {coupon.code} aplicado: {couponLabel}
          </p>
        )}
      </div>

      <div className="mt-6 flex flex-col gap-2 border-t border-black/12 pt-6">
        <div className="flex items-center justify-between text-sm text-[#1a1a1a]/70">
          <span>Subtotal</span>
          <span>{formatPrice(subtotal)}</span>
        </div>
        {coupon && (
          <div className="flex items-center justify-between text-sm text-green-700">
            <span>Descuento ({couponLabel})</span>
            <span>-{formatPrice(discount)}</span>
          </div>
        )}
        <div className="flex items-center justify-between">
          <span className="font-serif text-xl">Total</span>
          <span className="font-serif text-xl">{formatPrice(total)}</span>
        </div>
      </div>

      <p className="mt-4 text-xs text-[#1a1a1a]/60">
        El costo de envío es adicional al precio del producto y se coordina por WhatsApp.
      </p>

      {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

      {props.userEmail ? (
        <button
          onClick={handleCheckout}
          disabled={loading}
          className={`mt-6 w-full ${BUTTON_PRIMARY}`}
        >
          {loading ? "Redirigiendo a Mercado Pago..." : "Pagar con Mercado Pago"}
        </button>
      ) : (
        <Link href="/cuenta/login?next=/carrito" className={`mt-6 block w-full text-center ${BUTTON_PRIMARY}`}>
          Iniciar sesión para pagar
        </Link>
      )}
    </div>
  );
}
