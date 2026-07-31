-- Permite que un producto no tenga precio fijo ("a consultar"): el precio
-- pasa a ser opcional en las 5 categorías. Un precio NULL significa
-- "a consultar" en toda la app (formatPrice, checkout, etc.).
alter table public.books alter column price drop not null;
alter table public.agendas alter column base_price drop not null;
alter table public.artesanias alter column price drop not null;
alter table public.varios_products alter column price drop not null;
alter table public.cursos alter column price drop not null;

alter table public.books alter column price drop default;
alter table public.agendas alter column base_price drop default;
alter table public.artesanias alter column price drop default;
alter table public.varios_products alter column price drop default;
alter table public.cursos alter column price drop default;
