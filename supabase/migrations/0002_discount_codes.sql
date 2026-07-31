-- ============================================================
-- Cupones de descuento
-- ============================================================

create table if not exists public.discount_codes (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  percent_off numeric(5,2) not null check (percent_off > 0 and percent_off <= 100),
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.discount_codes enable row level security;

-- Solo el admin puede ver/gestionar los cupones. La validación de un código
-- puntual la hace el servidor con la service role key (endpoint /api/coupon/validate).
drop policy if exists "discount_codes_admin_all" on public.discount_codes;
create policy "discount_codes_admin_all" on public.discount_codes
  for all using (public.is_admin()) with check (public.is_admin());

alter table public.orders add column if not exists coupon_code text;
