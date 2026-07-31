"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/lib/cart-store";
import PhotoUploader, { type UploadedPhoto } from "@/components/PhotoUploader";
import WhatsappDeliveryNote from "@/components/WhatsappDeliveryNote";
import { BUTTON_PRIMARY, BUTTON_OUTLINE, INPUT, LABEL } from "@/lib/ui";
import type { Artesania } from "@/types/database";

export default function ArtesaniaCustomizeForm(props: { artesania: Artesania; userId: string | null }) {
  const router = useRouter();
  const addItem = useCartStore((s) => s.addItem);

  const [color, setColor] = useState("");
  const [grabado, setGrabado] = useState("");
  const [notas, setNotas] = useState("");
  const [photos, setPhotos] = useState<UploadedPhoto[]>([]);

  function handleAddToCart(goToCart: boolean) {
    if (props.artesania.price === null) return;
    addItem({
      productType: "artesania",
      productId: props.artesania.id,
      title: props.artesania.name,
      unitPrice: props.artesania.price,
      quantity: 1,
      image: props.artesania.image_urls?.[0],
      customization: {
        color: color || undefined,
        grabado: grabado || undefined,
        notas: notas || undefined,
        fotos: photos.map((p) => p.path),
      },
    });
    if (goToCart) router.push("/carrito");
  }

  return (
    <div className="flex flex-col gap-5">
      <div>
        <label className={`mb-1.5 block ${LABEL}`}>Color preferido (opcional)</label>
        <input value={color} onChange={(e) => setColor(e.target.value)} className={INPUT} />
      </div>

      <div>
        <label className={`mb-1.5 block ${LABEL}`}>Texto para grabar (opcional)</label>
        <input value={grabado} onChange={(e) => setGrabado(e.target.value)} className={INPUT} />
      </div>

      <div>
        <label className={`mb-1.5 block ${LABEL}`}>Notas</label>
        <textarea
          value={notas}
          onChange={(e) => setNotas(e.target.value)}
          className={INPUT}
          rows={3}
        />
      </div>

      <div>
        <label className={`mb-1.5 block ${LABEL}`}>Fotos de referencia (opcional)</label>
        {props.userId ? (
          <PhotoUploader
            bucket="artesania-photos"
            userId={props.userId}
            photos={photos}
            onChange={setPhotos}
          />
        ) : (
          <p className="text-sm text-[#2b2622]/60">
            <Link href={`/cuenta/login?next=/artesanias/${props.artesania.id}`} className="underline">
              Iniciá sesión
            </Link>{" "}
            para subir fotos de referencia.
          </p>
        )}
      </div>

      {props.artesania.price !== null ? (
        <>
          <WhatsappDeliveryNote />
          <div className="flex gap-3">
            <button onClick={() => handleAddToCart(false)} className={`flex-1 ${BUTTON_PRIMARY}`}>
              Agregar al carrito
            </button>
            <button onClick={() => handleAddToCart(true)} className={`flex-1 ${BUTTON_OUTLINE}`}>
              Comprar ahora
            </button>
          </div>
        </>
      ) : (
        <WhatsappDeliveryNote
          label="Consultá el precio por WhatsApp."
          message={`Hola! Quiero consultar el precio de "${props.artesania.name}".`}
        />
      )}
    </div>
  );
}
