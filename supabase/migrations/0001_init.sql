-- ============================================================
-- Esquema inicial: perfiles, catálogos (libros/agendas/artesanías/varios),
-- pedidos y control de acceso a libros protegidos.
-- Ejecutar en el SQL Editor de Supabase (o vía supabase db push).
-- ============================================================

create extension if not exists "pgcrypto";

-- ------------------------------------------------------------
-- PROFILES
-- ------------------------------------------------------------
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  full_name text,
  phone text,
  is_admin boolean not null default false,
  created_at timestamptz not null default now()
);

-- Crea automáticamente el perfil cuando alguien se registra
create function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email);
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ------------------------------------------------------------
-- CATÁLOGOS
-- ------------------------------------------------------------
create table public.books (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  author text,
  description text,
  price numeric(12,2) not null default 0,
  cover_url text,
  file_path text,          -- ruta dentro del bucket privado 'books'
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.agendas (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  base_price numeric(12,2) not null default 0,
  cover_url text,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.artesanias (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  price numeric(12,2) not null default 0,
  image_urls text[] not null default '{}',
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.varios_products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  price numeric(12,2) not null default 0,
  image_url text,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

-- ------------------------------------------------------------
-- PEDIDOS
-- ------------------------------------------------------------
create table public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  status text not null default 'pending' check (status in ('pending', 'paid', 'failed', 'cancelled')),
  total numeric(12,2) not null default 0,
  mp_preference_id text,
  mp_payment_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders (id) on delete cascade,
  product_type text not null check (product_type in ('libro', 'agenda', 'artesania', 'varios')),
  product_id uuid not null,
  title text not null,
  quantity integer not null default 1,
  unit_price numeric(12,2) not null,
  customization jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

-- ------------------------------------------------------------
-- ACCESO A LIBROS PROTEGIDOS
-- ------------------------------------------------------------
create table public.book_access (
  id uuid primary key default gen_random_uuid(),
  book_id uuid not null references public.books (id) on delete cascade,
  user_id uuid references public.profiles (id) on delete cascade,
  order_id uuid references public.orders (id) on delete set null,
  code text not null unique,
  email_sent_to text,
  redeemed_at timestamptz,
  created_at timestamptz not null default now()
);

create index book_access_book_id_idx on public.book_access (book_id);
create index book_access_user_id_idx on public.book_access (user_id);
create index order_items_order_id_idx on public.order_items (order_id);
create index orders_user_id_idx on public.orders (user_id);

-- ------------------------------------------------------------
-- ROW LEVEL SECURITY
-- ------------------------------------------------------------
alter table public.profiles enable row level security;
alter table public.books enable row level security;
alter table public.agendas enable row level security;
alter table public.artesanias enable row level security;
alter table public.varios_products enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.book_access enable row level security;

-- Helper: ¿el usuario actual es admin?
create function public.is_admin()
returns boolean
language sql
security definer set search_path = public
stable
as $$
  select coalesce((select is_admin from public.profiles where id = auth.uid()), false);
$$;

-- profiles
create policy "profiles_select_own_or_admin" on public.profiles
  for select using (auth.uid() = id or public.is_admin());
create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = id);

-- catálogos: lectura pública de productos activos, escritura solo admin
create policy "books_public_read" on public.books
  for select using (is_active or public.is_admin());
create policy "books_admin_write" on public.books
  for all using (public.is_admin()) with check (public.is_admin());

create policy "agendas_public_read" on public.agendas
  for select using (is_active or public.is_admin());
create policy "agendas_admin_write" on public.agendas
  for all using (public.is_admin()) with check (public.is_admin());

create policy "artesanias_public_read" on public.artesanias
  for select using (is_active or public.is_admin());
create policy "artesanias_admin_write" on public.artesanias
  for all using (public.is_admin()) with check (public.is_admin());

create policy "varios_public_read" on public.varios_products
  for select using (is_active or public.is_admin());
create policy "varios_admin_write" on public.varios_products
  for all using (public.is_admin()) with check (public.is_admin());

-- orders / order_items: cada usuario ve solo lo suyo; admin ve todo
create policy "orders_select_own_or_admin" on public.orders
  for select using (auth.uid() = user_id or public.is_admin());
create policy "orders_insert_own" on public.orders
  for insert with check (auth.uid() = user_id);
create policy "orders_admin_update" on public.orders
  for update using (public.is_admin());

create policy "order_items_select_own_or_admin" on public.order_items
  for select using (
    exists (select 1 from public.orders o where o.id = order_id and (o.user_id = auth.uid() or public.is_admin()))
  );
create policy "order_items_insert_own" on public.order_items
  for insert with check (
    exists (select 1 from public.orders o where o.id = order_id and o.user_id = auth.uid())
  );

-- book_access: cada usuario ve sus propios accesos; admin ve todo.
-- Los inserts (generación de códigos tras el pago) los hace el webhook con la service role key, que no pasa por RLS.
create policy "book_access_select_own_or_admin" on public.book_access
  for select using (auth.uid() = user_id or public.is_admin());

-- ------------------------------------------------------------
-- STORAGE BUCKETS
-- ------------------------------------------------------------
insert into storage.buckets (id, name, public)
values
  ('covers', 'covers', true),              -- portadas de libros, fotos de agendas/artesanías de catálogo (públicas)
  ('books', 'books', false),                -- archivos protegidos de libros (acceso vía URL firmada)
  ('agenda-photos', 'agenda-photos', false),   -- fotos subidas por usuarios para personalizar agendas
  ('artesania-photos', 'artesania-photos', false) -- fotos subidas por usuarios para personalizar artesanías
on conflict (id) do nothing;

-- Cualquiera puede leer 'covers' (bucket público)
create policy "covers_public_read" on storage.objects
  for select using (bucket_id = 'covers');
create policy "covers_admin_write" on storage.objects
  for all using (bucket_id = 'covers' and public.is_admin())
  with check (bucket_id = 'covers' and public.is_admin());

-- Solo admin gestiona los archivos de libros; la lectura se hace con service role (URL firmada)
create policy "books_bucket_admin_only" on storage.objects
  for all using (bucket_id = 'books' and public.is_admin())
  with check (bucket_id = 'books' and public.is_admin());

-- Usuarios autenticados pueden subir sus propias fotos de personalización
create policy "agenda_photos_insert_own" on storage.objects
  for insert with check (bucket_id = 'agenda-photos' and auth.role() = 'authenticated');
create policy "agenda_photos_select_own_or_admin" on storage.objects
  for select using (
    bucket_id = 'agenda-photos' and (owner = auth.uid() or public.is_admin())
  );

create policy "artesania_photos_insert_own" on storage.objects
  for insert with check (bucket_id = 'artesania-photos' and auth.role() = 'authenticated');
create policy "artesania_photos_select_own_or_admin" on storage.objects
  for select using (
    bucket_id = 'artesania-photos' and (owner = auth.uid() or public.is_admin())
  );
