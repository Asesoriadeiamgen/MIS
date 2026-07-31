-- ============================================================
-- Contenido para el sitio de María Isabel Sosa (asesora de imagen):
-- servicios (informativos, no van al carrito), packs/programas
-- (sí compran vía Mercado Pago), portfolio antes/después,
-- testimonios, blog y preguntas frecuentes.
-- Reutiliza el mismo patrón de catálogo público + escritura solo-admin
-- que libros/agendas/artesanías/varios/cursos.
-- ============================================================

-- ------------------------------------------------------------
-- SERVICIOS (colorimetría, guardarropa, personal shopper, etc.)
-- No son productos de carrito: la página solo muestra info + CTA a /agenda o WhatsApp.
-- ------------------------------------------------------------
create table public.servicios (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  price numeric(12,2), -- nullable: "a consultar" si no se carga
  modalidad text not null default 'ambas' check (modalidad in ('online', 'presencial', 'ambas')),
  image_urls text[] not null default '{}',
  is_active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

-- ------------------------------------------------------------
-- PACKS / PROGRAMAS (sesión individual o de varias sesiones — se compran)
-- ------------------------------------------------------------
create table public.packs (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  price numeric(12,2),
  sessions_count integer,
  image_urls text[] not null default '{}',
  is_active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

-- ------------------------------------------------------------
-- PORTFOLIO (antes/después o galería simple)
-- ------------------------------------------------------------
create table public.portfolio (
  id uuid primary key default gen_random_uuid(),
  title text,
  description text,
  image_url text,
  before_image_url text,
  after_image_url text,
  is_active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

-- ------------------------------------------------------------
-- TESTIMONIOS
-- ------------------------------------------------------------
create table public.testimonios (
  id uuid primary key default gen_random_uuid(),
  client_name text not null,
  quote text not null,
  photo_url text,
  rating smallint check (rating between 1 and 5),
  is_active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

-- ------------------------------------------------------------
-- BLOG
-- ------------------------------------------------------------
create table public.blog_posts (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  excerpt text,
  content text not null, -- HTML enriquecido (negrita, listas, etc.)
  cover_url text,
  published_at timestamptz not null default now(),
  is_active boolean not null default true, -- funciona como publicado/borrador
  created_at timestamptz not null default now()
);

-- ------------------------------------------------------------
-- PREGUNTAS FRECUENTES
-- ------------------------------------------------------------
create table public.faqs (
  id uuid primary key default gen_random_uuid(),
  question text not null,
  answer text not null,
  is_active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create index blog_posts_slug_idx on public.blog_posts (slug);

-- ------------------------------------------------------------
-- ROW LEVEL SECURITY
-- ------------------------------------------------------------
alter table public.servicios enable row level security;
alter table public.packs enable row level security;
alter table public.portfolio enable row level security;
alter table public.testimonios enable row level security;
alter table public.blog_posts enable row level security;
alter table public.faqs enable row level security;

create policy "servicios_public_read" on public.servicios
  for select using (is_active or public.is_admin());
create policy "servicios_admin_write" on public.servicios
  for all using (public.is_admin()) with check (public.is_admin());

create policy "packs_public_read" on public.packs
  for select using (is_active or public.is_admin());
create policy "packs_admin_write" on public.packs
  for all using (public.is_admin()) with check (public.is_admin());

create policy "portfolio_public_read" on public.portfolio
  for select using (is_active or public.is_admin());
create policy "portfolio_admin_write" on public.portfolio
  for all using (public.is_admin()) with check (public.is_admin());

create policy "testimonios_public_read" on public.testimonios
  for select using (is_active or public.is_admin());
create policy "testimonios_admin_write" on public.testimonios
  for all using (public.is_admin()) with check (public.is_admin());

create policy "blog_posts_public_read" on public.blog_posts
  for select using (is_active or public.is_admin());
create policy "blog_posts_admin_write" on public.blog_posts
  for all using (public.is_admin()) with check (public.is_admin());

create policy "faqs_public_read" on public.faqs
  for select using (is_active or public.is_admin());
create policy "faqs_admin_write" on public.faqs
  for all using (public.is_admin()) with check (public.is_admin());

-- order_items.product_type necesita aceptar 'pack' (los packs/programas se compran vía Mercado Pago).
alter table public.order_items drop constraint order_items_product_type_check;
alter table public.order_items add constraint order_items_product_type_check
  check (product_type in ('libro', 'agenda', 'artesania', 'varios', 'curso', 'pack'));
