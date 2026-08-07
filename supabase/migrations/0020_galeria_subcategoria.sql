-- ============================================================
-- Subcarpetas dentro de una categoría de galería. Ej: la categoría
-- "Charlas Institucionales" puede tener varias subcarpetas, una por
-- charla, cada una con su propia serie de fotos. Es opcional: una
-- categoría sin subcategoría sigue funcionando como antes (carrusel
-- directo de fotos).
-- ============================================================

alter table public.galeria_fotos add column if not exists subcategory text;

create index if not exists galeria_fotos_subcategory_idx on public.galeria_fotos (category, subcategory);
