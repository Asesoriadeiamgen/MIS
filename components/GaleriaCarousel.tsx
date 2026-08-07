"use client";

import { useState } from "react";
import { IconCamara } from "@/components/icons";

type Foto = { id: string; image_url: string; caption: string | null };

function FolderButton(props: { label: string; count: number; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={props.onClick}
      className="group flex items-center gap-4 rounded-sm bg-lilac-deep px-6 py-7 text-left text-white transition hover:-translate-y-0.5 hover:bg-lilac hover:shadow-md"
    >
      <IconCamara className="h-8 w-8 flex-shrink-0" />
      <span>
        <span className="block font-serif text-lg leading-snug">{props.label}</span>
        <span className="mt-0.5 block text-xs text-white/75">
          {props.count} {props.count === 1 ? "foto" : "fotos"}
        </span>
      </span>
    </button>
  );
}

export default function GaleriaCarousel({
  categories,
  photosByCategory,
}: {
  categories: string[];
  // photosByCategory[category][subcategory] — subcategory "" agrupa las fotos
  // sueltas de la categoría (sin subcarpeta).
  photosByCategory: Record<string, Record<string, Foto[]>>;
}) {
  // null = pantalla de carpetas. Al elegir una categoría, si tiene subcarpetas
  // reales se muestra otra pantalla de carpetas antes de llegar al carrusel.
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [activeSubcategory, setActiveSubcategory] = useState<string | null>(null);
  const [index, setIndex] = useState(0);

  const subMap = activeCategory ? photosByCategory[activeCategory] ?? {} : {};
  const subKeys = Object.keys(subMap);
  const hasSubfolders = subKeys.some((k) => k !== "");

  function openCategory(c: string) {
    setActiveCategory(c);
    setActiveSubcategory(null);
    setIndex(0);
  }

  function openSubcategory(s: string) {
    setActiveSubcategory(s);
    setIndex(0);
  }

  function backToCategories() {
    setActiveCategory(null);
    setActiveSubcategory(null);
  }

  function backToSubcategories() {
    setActiveSubcategory(null);
    setIndex(0);
  }

  const fotos: Foto[] =
    activeCategory && (activeSubcategory !== null || !hasSubfolders)
      ? subMap[activeSubcategory ?? ""] ?? []
      : [];
  const foto = fotos[index];

  function go(direction: 1 | -1) {
    if (fotos.length === 0) return;
    setIndex((i) => (i + direction + fotos.length) % fotos.length);
  }

  // Pantalla 1: carpetas de categoría.
  if (!activeCategory) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {categories.map((c) => {
          const count = Object.values(photosByCategory[c] ?? {}).reduce((sum, arr) => sum + arr.length, 0);
          return <FolderButton key={c} label={c} count={count} onClick={() => openCategory(c)} />;
        })}
      </div>
    );
  }

  // Pantalla 2: subcarpetas dentro de la categoría elegida (solo si existen).
  if (hasSubfolders && activeSubcategory === null) {
    return (
      <div>
        <button
          type="button"
          onClick={backToCategories}
          className="mb-5 text-xs font-medium uppercase tracking-widest text-[#1a1a1a]/60 hover:text-lilac-deep"
        >
          ← Volver a las carpetas
        </button>

        <h2 className="mb-5 flex items-center justify-center gap-2 text-center font-serif text-xl">
          <IconCamara className="h-5 w-5 text-lilac-deep" />
          {activeCategory}
        </h2>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {subKeys
            .slice()
            .sort((a, b) => (a === "" ? -1 : b === "" ? 1 : a.localeCompare(b)))
            .map((s) => (
              <FolderButton
                key={s}
                label={s || "Otras fotos"}
                count={subMap[s].length}
                onClick={() => openSubcategory(s)}
              />
            ))}
        </div>
      </div>
    );
  }

  // Pantalla 3: carrusel de fotos, de una foto a la vez.
  return (
    <div>
      <button
        type="button"
        onClick={hasSubfolders ? backToSubcategories : backToCategories}
        className="mb-5 text-xs font-medium uppercase tracking-widest text-[#1a1a1a]/60 hover:text-lilac-deep"
      >
        ← {hasSubfolders ? "Volver a las subcarpetas" : "Volver a las carpetas"}
      </button>

      <h2 className="mb-5 flex items-center justify-center gap-2 text-center font-serif text-xl">
        <IconCamara className="h-5 w-5 text-lilac-deep" />
        {activeSubcategory ? `${activeCategory} — ${activeSubcategory}` : activeCategory}
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
