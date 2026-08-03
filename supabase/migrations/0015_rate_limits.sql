-- ============================================================
-- Límite de intentos (cupones, reservas de turno) por IP
-- ============================================================

create table if not exists public.rate_limit_events (
  id uuid primary key default gen_random_uuid(),
  key text not null,
  created_at timestamptz not null default now()
);

create index if not exists rate_limit_events_key_created_idx
  on public.rate_limit_events (key, created_at);

-- Sin policies públicas a propósito: solo el server (service role, que
-- bypassea RLS) lee/escribe acá. Nadie puede leer ni tocar esta tabla
-- desde el cliente.
alter table public.rate_limit_events enable row level security;
