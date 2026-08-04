"use client";

import { useState } from "react";

type Foto = { id: string; image_url: string; caption: string | null };

export default function GaleriaCarousel({
  categories,
  photosByCategory,
}: {
  categories: string[];
  photosByCategory: Record<string, Foto[]>;
}) {
  const [active, setActive] = useState(categories[0] ?? "");
  const [index, setIndex] = useState(0);

  const fotos = photosByCategory[active] ?? [];
  const foto = fotos[index];

  function selectCategory(c: string) {
    setActive(c);
    setIndex(0);
  }

  function go(direction: 1 | -1) {
    if (fotos.length === 0) return;
    setIndex((i) => (i + direction + fotos.length) % fotos.length);
  }

  return (
    <div>
      <div className="mb-6 flex flex-wrap justify-center gap-2">
        {categories.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => selectCategory(c)}
            className={`rounded-full border px-4 py-1.5 text-xs font-medium uppercase tracking-widest transition ${
              c === active
                ? "border-lilac-deep bg-lilac-deep text-white"
                : "border-black/15 text-[#1a1a1a]/70 hover:border-lilac-deep"
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      {fotos.length === 0 || !foto ? (
        <p className="text-center text-sm text-[#1a1a1a]/50">Todavía no hay fotos en esta categoría.</p>
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
