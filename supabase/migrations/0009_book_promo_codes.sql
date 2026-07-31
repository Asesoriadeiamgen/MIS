-- Códigos compartidos: un mismo código que varias personas distintas pueden
-- canjear (cada una una sola vez), a diferencia de los códigos individuales
-- de book_access que quedan atados a la primera persona que los usa.
create table public.book_promo_codes (
  id uuid primary key default gen_random_uuid(),
  book_id uuid not null references public.books (id) on delete cascade,
  code text not null unique,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.book_promo_codes enable row level security;

create policy "book_promo_codes_admin_all" on public.book_promo_codes
  for all using (public.is_admin()) with check (public.is_admin());

create index book_promo_codes_book_id_idx on public.book_promo_codes (book_id);
