-- ============================================================
-- Vouchers de regalo: catálogo simple (nombre, descripción, precio, foto),
-- mismo patrón que servicios/portfolio. Por ahora la compra se coordina por
-- WhatsApp, igual que las formaciones.
-- ============================================================

create table public.vouchers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  price numeric(12,2),
  image_url text,
  is_active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

alter table public.vouchers enable row level security;

create policy "vouchers_public_read" on public.vouchers
  for select using (is_active or public.is_admin());
create policy "vouchers_admin_write" on public.vouchers
  for all using (public.is_admin()) with check (public.is_admin());

-- La categoría "Voucher de Regalo" que ya cargaste en el admin tenía un link
-- placeholder ("Regalo"); la apunto a la página nueva.
update public.tienda_categorias set href = '/regalos' where title = 'Voucher de Regalo';
