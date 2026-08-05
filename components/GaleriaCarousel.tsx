"use client";

import { useState } from "react";
import { IconCamara } from "@/components/icons";

type Foto = { id: string; image_url: string; caption: string | null };

export default function GaleriaCarousel({
  categories,
  photosByCategory,
}: {
  categories: string[];
  photosByCategory: Record<string, Foto[]>;
}) {
  // null = pantalla de carpetas. Al elegir una se pasa al carrusel de esa carpeta.
  const [active, setActive] = useState<string | null>(null);
  const [index, setIndex] = useState(0);

  function openCategory(c: string) {
    setActive(c);
    setIndex(0);
  }

  const fotos = active ? photosByCategory[active] ?? [] : [];
  const foto = fotos[index];

  function go(direction: 1 | -1) {
    if (fotos.length === 0) return;
    setIndex((i) => (i + direction + fotos.length) % fotos.length);
  }

  if (!active) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {categories.map((c) => {
          const count = photosByCategory[c]?.length ?? 0;
          return (
            <button
              key={c}
              type="button"
              onClick={() => openCategory(c)}
              className="group flex items-center gap-4 rounded-sm bg-lilac-deep px-6 py-7 text-left text-white transition hover:-translate-y-0.5 hover:bg-lilac hover:shadow-md"
            >
              <IconCamara className="h-8 w-8 flex-shrink-0" />
              <span>
                <span className="block font-serif text-lg leading-snug">{c}</span>
                <span className="mt-0.5 block text-xs text-white/75">
                  {count} {count === 1 ? "foto" : "fotos"}
                </span>
              </span>
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div>
      <button
        type="button"
        onClick={() => setActive(null)}
        className="mb-5 text-xs font-medium uppercase tracking-widest text-[#1a1a1a]/60 hover:text-lilac-deep"
      >
        ← Volver a las carpetas
      </button>

      <h2 className="mb-5 flex items-center justify-center gap-2 text-center font-serif text-xl">
        <IconCamara className="h-5 w-5 text-lilac-deep" />
        {active}
      </h2>

      {fotos.length === 0 || !foto ? (
        <p className="text-center text-sm text-[#1a1a1a]/50">Todavía no hay fotos en esta carpeta.</p>
      ) : (
        <div className="mx-auto flex max-w-2xl flex-col items-center">
          <div className="flex w-full items-center gap-3">
            <button
              type="button"
              onClick={() => go(-1)}
              disabled={fotos.length < 2}
              aria-label="Foto anterior"
              className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full border border-black/15 bg-white text-xl shadow-sm hover:bg-soft-bg disabled:opacity-30"
            >
              ‹
            </button>

            <div className="aspect-[4/3] flex-1 overflow-hidden rounded-sm bg-soft-bg">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                key={foto.id}
                src={foto.image_url}
                alt={foto.caption ?? ""}
                className="h-full w-full object-contain"
              />
            </div>

            <button
              type="button"
              onClick={() => go(1)}
              disabled={fotos.length < 2}
              aria-label="Foto siguiente"
              className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full border border-black/15 bg-white text-xl shadow-sm hover:bg-soft-bg disabled:opacity-30"
            >
              ›
            </button>
          </div>

          {foto.caption && <p className="mt-3 text-center text-sm text-[#1a1a1a]/60">{foto.caption}</p>}
          {fotos.length > 1 && (
            <p className="mt-2 text-xs text-[#1a1a1a]/40">
              {index + 1} / {fotos.length}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
