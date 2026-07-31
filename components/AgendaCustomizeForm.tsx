"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/lib/cart-store";
import PhotoUploader, { type UploadedPhoto } from "@/components/PhotoUploader";
import WhatsappDeliveryNote from "@/components/WhatsappDeliveryNote";
import { BUTTON_PRIMARY, BUTTON_OUTLINE, INPUT, LABEL } from "@/lib/ui";
import type { Agenda } from "@/types/database";

const COLORES = [
  "Negro",
  "Marrón",
  "Beige",
  "Verde",
  "Bordó",
  "Pasteles",
  "Rosa",
  "Amarillo",
  "Azul",
  "Lila",
  "Violeta",
  "Turquesa",
  "Blanco",
  "Naranja",
  "Terracota",
];
const COLORES_2 = ["Ninguno", ...COLORES];
const TIPOS_FRASE = ["Inspiradoras", "Religiosas", "Famosas", "Románticas"];

export default function AgendaCustomizeForm(props: { agenda: Agenda; userId: string | null }) {
  const router = useRouter();
  const addItem = useCartStore((s) => s.addItem);

  const [color1, setColor1] = useState(COLORES[0]);
  const [color2, setColor2] = useState(COLORES_2[0]);
  const [quiereFrases, setQuiereFrases] = useState<"si" | "no">("no");
  const [tipoFrase, setTipoFrase] = useState(TIPOS_FRASE[0]);
  const [hojaEspecial, setHojaEspecial] = useState("");
  const [notas, setNotas] = useState("");
  const [photos, setPhotos] = useState<UploadedPhoto[]>([]);

  function handleAddToCart(goToCart: boolean) {
    if (props.agenda.base_price === null) return;
    addItem({
      productType: "agenda",
      productId: props.agenda.id,
      title: `${props.agenda.name} (personalizada)`,
      unitPrice: props.agenda.base_price,
      quantity: 1,
      image: props.agenda.cover_url ?? undefined,
      customization: {
        color1,
        color2,
        quiereFrases: quiereFrases === "si",
        tipoFrase: quiereFrases === "si" ? tipoFrase : null,
        hojaEspecial,
        notas,
        fotos: photos.map((p) => p.path),
      },
    });
    if (goToCart) router.push("/carrito");
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex gap-3">
        <div className="flex-1">
          <label className={`mb-1.5 block ${LABEL}`}>Color 1</label>
          <select value={color1} onChange={(e) => setColor1(e.target.value)} className={INPUT}>
            {COLORES.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </div>
        <div className="flex-1">
          <label className={`mb-1.5 block ${LABEL}`}>Color 2</label>
          <select value={color2} onChange={(e) => setColor2(e.target.value)} className={INPUT}>
            {COLORES_2.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className={`mb-1.5 block ${LABEL}`}>¿Querés que la agenda tenga frases?</label>
        <select
          value={quiereFrases}
          onChange={(e) => setQuiereFrases(e.target.value as "si" | "no")}
          className={INPUT}
        >
          <option value="no">No</option>
          <option value="si">Sí</option>
        </select>
      </div>

      {quiereFrases === "si" && (
        <div>
          <label className={`mb-1.5 block ${LABEL}`}>Tipo de frase</label>
          <select value={tipoFrase} onChange={(e) => setTipoFrase(e.target.value)} className={INPUT}>
            {TIPOS_FRASE.map((t) => (
              <option key={t}>{t}</option>
            ))}
          </select>
        </div>
      )}

      <div>
        <label className={`mb-1.5 block ${LABEL}`}>
          ¿Tiene alguna hoja o formulario especial que quieras incluir?
        </label>
        <textarea
          value={hojaEspecial}
          onChange={(e) => setHojaEspecial(e.target.value)}
          className={INPUT}
          rows={2}
          placeholder="Opcional"
        />
      </div>

      <div>
        <label className={`mb-1.5 block ${LABEL}`}>Notas para el diseño</label>
        <textarea
          value={notas}
          onChange={(e) => setNotas(e.target.value)}
          className={INPUT}
          rows={3}
        />
      </div>

      <div>
        <label className={`mb-1.5 block ${LABEL}`}>Tus fotos (opcional)</label>
        {props.userId ? (
          <PhotoUploader
            bucket="agenda-photos"
            userId={props.userId}
            photos={photos}
            onChange={setPhotos}
            max={30}
          />
        ) : (
          <p className="text-sm text-[#2b2622]/60">
            <Link href={`/cuenta/login?next=/agendas/${props.agenda.id}`} className="underline">
              Iniciá sesión
            </Link>{" "}
            para subir tus propias fotos.
          </p>
        )}
      </div>

      {props.agenda.base_price !== null ? (
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
          message={`Hola! Quiero consultar el precio de la agenda "${props.agenda.name}" personalizada.`}
        />
      )}
    </div>
  );
}
