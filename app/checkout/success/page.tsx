"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useCartStore } from "@/lib/cart-store";
import { BUTTON_PRIMARY, BUTTON_OUTLINE } from "@/lib/ui";

export default function CheckoutSuccessPage() {
  const clear = useCartStore((s) => s.clear);

  useEffect(() => {
    clear();
  }, [clear]);

  return (
    <div className="mx-auto max-w-2xl px-4 py-24 text-center">
      <h1 className="mb-3 font-serif text-3xl">¡Pago confirmado!</h1>
      <p className="mb-8 text-[#2b2622]/70">
        Te enviamos un email con la confirmación. Si compraste un libro, el código de acceso llega por
        email en los próximos minutos.
      </p>
      <div className="flex justify-center gap-4">
        <Link href="/cuenta/perfil" className={BUTTON_PRIMARY}>
          Ver mis pedidos
        </Link>
        <Link href="/" className={BUTTON_OUTLINE}>
          Seguir comprando
        </Link>
      </div>
    </div>
  );
}
