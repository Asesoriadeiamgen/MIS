-- ============================================================
-- Contenido editable de "Sobre mí" (fila única)
-- ============================================================

create table if not exists public.about_page (
  id int primary key default 1,
  photo_url text,
  formacion_html text,
  filosofia_html text,
  historia_html text,
  updated_at timestamptz not null default now(),
  constraint about_page_singleton check (id = 1)
);

insert into public.about_page (id, filosofia_html)
values (
  1,
  '<p>La imagen como coherencia entre lo interno y lo externo: no se trata solo de qué usás, sino de que lo que mostrás hacia afuera refleje quién sos por dentro.</p>'
)
on conflict (id) do nothing;

alter table public.about_page enable row level security;

drop policy if exists "about_page_public_read" on public.about_page;
create policy "about_page_public_read" on public.about_page
  for select using (true);

drop policy if exists "about_page_admin_write" on public.about_page;
create policy "about_page_admin_write" on public.about_page
  for all using (public.is_admin()) with check (public.is_admin());
