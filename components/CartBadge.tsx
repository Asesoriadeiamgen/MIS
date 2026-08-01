"use client";

import Link from "next/link";
import { useCartStore, cartCount, useCartHydrated } from "@/lib/cart-store";
import { IconCarrito } from "@/components/icons";

export default function CartBadge() {
  const items = useCartStore((s) => s.items);
  const hydrated = useCartHydrated();

  const count = hydrated ? cartCount(items) : 0;

  return (
    <Link href="/carrito" className="relative flex items-center gap-1 hover:text-lilac-deep">
      <IconCarrito className="h-4 w-4" />
      Carrito
      {count > 0 && (
        <span className="absolute -right-3 -top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#1a1a1a] px-1 text-[10px] normal-case tracking-normal text-white">
          {count}
        </span>
      )}
    </Link>
  );
}
