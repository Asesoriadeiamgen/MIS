-- ============================================================
-- Categorías de la Tienda (los "tiles" de arriba: Ebooks, Cursos,
-- Formaciones, Consultorías, etc.), ahora editables desde el admin en vez
-- de estar hardcodeadas en el código. El ícono es un emoji simple para no
-- depender de elegir entre los íconos SVG del código.
-- ============================================================

create table public.tienda_categorias (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  href text not null,
  emoji text,
  is_active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

alter table public.tienda_categorias enable row level security;

create policy "tienda_categorias_public_read" on public.tienda_categorias
  for select using (is_active or public.is_admin());
create policy "tienda_categorias_admin_write" on public.tienda_categorias
  for all using (public.is_admin()) with check (public.is_admin());

-- Las 4 categorías que ya existían en el código, para no perder nada al migrar.
insert into public.tienda_categorias (title, description, href, emoji, sort_order) values
  ('Ebooks y guías', 'PDFs descargables, acceso protegido.', '/libros', '📘', 1),
  ('Cursos online', 'Cursos con fecha de inicio.', '/cursos', '🎓', 2),
  ('Formaciones', 'Carreras, especializaciones y mentorías para asesoras de imagen.', '/formaciones', '✨', 3),
  ('Consultorías', 'Servicios de asesoría: colorimetría, guardarropa, personal shopper y más.', '/servicios', '💬', 4);
