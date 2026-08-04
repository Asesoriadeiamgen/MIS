"use client";

import { useRef, useState } from "react";

type Foto = { id: string; image_url: string; caption: string | null };

export default function GaleriaCarousel({
  categories,
  photosByCategory,
}: {
  categories: string[];
  photosByCategory: Record<string, Foto[]>;
}) {
  const [active, setActive] = useState(categories[0] ?? "");
  const trackRef = useRef<HTMLDivElement>(null);

  function scrollByCard(direction: 1 | -1) {
    const track = trackRef.current;
    if (!track) return;
    const card = track.querySelector<HTMLElement>("[data-card]");
    const amount = card ? card.offsetWidth + 16 : track.clientWidth * 0.8;
    track.scrollBy({ left: direction * amount, behavior: "smooth" });
  }

  const fotos = photosByCategory[active] ?? [];

  return (
    <div>
      <div className="mb-6 flex flex-wrap justify-center gap-2">
        {categories.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => setActive(c)}
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

      {fotos.length === 0 ? (
        <p className="text-center text-sm text-[#1a1a1a]/50">Todavía no hay fotos en esta categoría.</p>
      ) : (
        <div className="relative">
          <div
            ref={trackRef}
            className="flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {fotos.map((foto) => (
              <div
                key={foto.id}
                data-card
                className="aspect-[4/5] w-64 flex-shrink-0 snap-center overflow-hidden rounded-sm bg-soft-bg sm:w-80"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={foto.image_url} alt={foto.caption ?? ""} className="h-full w-full object-cover" />
                {foto.caption && (
                  <p className="mt-2 text-center text-xs text-[#1a1a1a]/60">{foto.caption}</p>
                )}
              </div>
            ))}
          </div>

          {fotos.length > 1 && (
            <>
              <button
                type="button"
                onClick={() => scrollByCard(-1)}
                aria-label="Foto anterior"
                className="absolute left-0 top-[38%] -translate-x-1/2 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-full border border-black/10 bg-white text-lg shadow-sm hover:bg-soft-bg"
              >
                ‹
              </button>
              <button
                type="button"
                onClick={() => scrollByCard(1)}
                aria-label="Foto siguiente"
                className="absolute right-0 top-[38%] translate-x-1/2 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-full border border-black/10 bg-white text-lg shadow-sm hover:bg-soft-bg"
              >
                ›
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
