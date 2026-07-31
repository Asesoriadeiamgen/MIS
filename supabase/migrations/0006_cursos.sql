-- Nueva categoría "Cursos": nombre, valor, tiempo de cursada, fecha de
-- comienzo, descripción y fotos. Reutiliza el mismo patrón de catálogo
-- público + escritura solo-admin que libros/agendas/artesanías/varios.
create table public.cursos (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  price numeric(12,2) not null default 0,
  duration text,
  start_date date,
  image_urls text[] not null default '{}',
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.cursos enable row level security;

create policy "cursos_public_read" on public.cursos
  for select using (is_active or public.is_admin());
create policy "cursos_admin_write" on public.cursos
  for all using (public.is_admin()) with check (public.is_admin());

-- order_items.product_type necesita aceptar 'curso' además de los tipos existentes.
alter table public.order_items drop constraint order_items_product_type_check;
alter table public.order_items add constraint order_items_product_type_check
  check (product_type in ('libro', 'agenda', 'artesania', 'varios', 'curso'));
