-- Cumpleaños (solo día y mes, sin año) en el perfil del usuario.
alter table public.profiles add column if not exists birth_day smallint check (birth_day between 1 and 31);
alter table public.profiles add column if not exists birth_month smallint check (birth_month between 1 and 12);

-- Varias fotos de catálogo para un diseño de agenda (antes solo admitía una, cover_url).
alter table public.agendas add column if not exists image_urls text[] not null default '{}';
