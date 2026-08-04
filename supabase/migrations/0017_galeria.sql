-- ============================================================
-- Galería de fotos, agrupada por categoría libre (la escribe el admin,
-- no es una lista fija: "Asesoría Personal", "Oncológica", "Empresarial", etc.)
-- ============================================================

create table public.galeria_fotos (
  id uuid primary key default gen_random_uuid(),
  category text not null,
  image_url text not null,
  caption text,
  is_active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create index galeria_fotos_category_idx on public.galeria_fotos (category);

alter table public.galeria_fotos enable row level security;

create policy "galeria_fotos_public_read" on public.galeria_fotos
  for select using (is_active or public.is_admin());
create policy "galeria_fotos_admin_write" on public.galeria_fotos
  for all using (public.is_admin()) with check (public.is_admin());
