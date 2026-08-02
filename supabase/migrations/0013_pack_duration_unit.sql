-- Formaciones (antes "packs"): la cantidad puede expresarse en distintas
-- unidades (sesiones, meses, semanas, días u horas), no solo "sesiones".
alter table public.packs add column if not exists duration_unit text not null default 'sesiones'
  check (duration_unit in ('sesiones', 'meses', 'semanas', 'dias', 'horas'));
