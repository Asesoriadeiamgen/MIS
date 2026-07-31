-- Orden manual: permite al admin mover productos arriba/abajo en libros,
-- agendas y artesanías. Se inicializa según el orden actual (más nuevo
-- primero) para que no cambie nada visualmente al correr esta migración.
alter table public.books add column if not exists sort_order integer not null default 0;
alter table public.agendas add column if not exists sort_order integer not null default 0;
alter table public.artesanias add column if not exists sort_order integer not null default 0;

with ranked as (
  select id, row_number() over (order by created_at desc)::int as rn from public.books
)
update public.books b set sort_order = ranked.rn from ranked where ranked.id = b.id;

with ranked as (
  select id, row_number() over (order by created_at desc)::int as rn from public.agendas
)
update public.agendas b set sort_order = ranked.rn from ranked where ranked.id = b.id;

with ranked as (
  select id, row_number() over (order by created_at desc)::int as rn from public.artesanias
)
update public.artesanias b set sort_order = ranked.rn from ranked where ranked.id = b.id;
