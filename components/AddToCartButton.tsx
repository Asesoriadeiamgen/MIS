"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/lib/cart-store";
import { BUTTON_PRIMARY, BUTTON_OUTLINE } from "@/lib/ui";
import type { ProductType } from "@/types/database";

export default function AddToCartButton(props: {
  productType: ProductType;
  productId: string;
  title: string;
  unitPrice: number;
  image?: string;
  customization?: Record<string, unknown>;
  label?: string;
}) {
  const addItem = useCartStore((s) => s.addItem);
  const router = useRouter();
  const [added, setAdded] = useState(false);

  function handleClick() {
    addItem({
      productType: props.productType,
      productId: props.productId,
      title: props.title,
      unitPrice: props.unitPrice,
      quantity: 1,
      image: props.image,
      customization: props.customization,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  }

  return (
    <div className="flex gap-3">
      <button onClick={handleClick} className={`flex-1 ${BUTTON_PRIMARY}`}>
        {added ? "¡Agregado!" : props.label || "Agregar al carrito"}
      </button>
      <button
        onClick={() => {
          handleClick();
          router.push("/carrito");
        }}
        className={`flex-1 ${BUTTON_OUTLINE}`}
      >
        Comprar ahora
      </button>
    </div>
  );
}
