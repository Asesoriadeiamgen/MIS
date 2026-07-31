-- Permitir cupones de monto fijo además de porcentaje.
alter table public.discount_codes alter column percent_off drop not null;
alter table public.discount_codes add column if not exists amount_off numeric(12,2) check (amount_off is null or amount_off > 0);

alter table public.discount_codes drop constraint if exists discount_codes_exactly_one_discount;
alter table public.discount_codes add constraint discount_codes_exactly_one_discount check (
  (percent_off is not null and amount_off is null) or (percent_off is null and amount_off is not null)
);
