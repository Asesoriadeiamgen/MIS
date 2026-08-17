-- ============================================================
-- Colorimetría: lista de artículos, mismo patrón que el blog.
-- El primer artículo (slug 'circulo-cromatico-y-sus-usos') muestra además
-- un círculo cromático interactivo (componente de cliente, no vive acá).
-- ============================================================

create table public.colorimetria_posts (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  excerpt text,
  content text not null,
  cover_url text,
  published_at timestamptz not null default now(),
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create index colorimetria_posts_slug_idx on public.colorimetria_posts (slug);

alter table public.colorimetria_posts enable row level security;

create policy "colorimetria_posts_public_read" on public.colorimetria_posts
  for select using (is_active or public.is_admin());
create policy "colorimetria_posts_admin_write" on public.colorimetria_posts
  for all using (public.is_admin()) with check (public.is_admin());

insert into public.colorimetria_posts (title, slug, excerpt, content) values (
  'Círculo cromático y sus usos',
  'circulo-cromatico-y-sus-usos',
  'Cómo leer el círculo cromático y usarlo para armar combinaciones de color que funcionan.',
  '<p>El círculo cromático ordena los colores según su relación entre sí y es la base para armar combinaciones prolijas en tu guardarropa, tu maquillaje o cualquier paleta de color.</p><p>Elegí un color en la rueda de abajo para ver sus combinaciones armónicas: complementaria, análoga, tríada y cuadrada.</p>'
);
