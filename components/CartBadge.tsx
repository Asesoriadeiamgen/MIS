"use client";

import Link from "next/link";
import { useCartStore, cartCount, useCartHydrated } from "@/lib/cart-store";

export default function CartBadge() {
  const items = useCartStore((s) => s.items);
  const hydrated = useCartHydrated();

  const count = hydrated ? cartCount(items) : 0;

  return (
    <Link href="/carrito" className="relative hover:text-lilac-deep">
      Carrito
      {count > 0 && (
        <span className="absolute -right-3 -top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#1a1a1a] px-1 text-[10px] normal-case tracking-normal text-white">
          {count}
        </span>
      )}
    </Link>
  );
}
