-- ============================================================
-- Agenda / turnos propios: disponibilidad semanal recurrente,
-- bloqueos puntuales y reservas. Todo queda admin-only por RLS;
-- lo único expuesto al público son dos funciones security definer
-- muy acotadas (consultar horarios libres y reservar), para no
-- filtrar datos de contacto de otros clientes ni permitir doble reserva.
-- ============================================================

-- ------------------------------------------------------------
-- DISPONIBILIDAD SEMANAL RECURRENTE
-- weekday: 0=domingo ... 6=sábado (igual que extract(dow from date) de Postgres)
-- ------------------------------------------------------------
create table public.disponibilidad_semanal (
  id uuid primary key default gen_random_uuid(),
  weekday smallint not null check (weekday between 0 and 6),
  start_time time not null,
  end_time time not null check (end_time > start_time),
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

-- ------------------------------------------------------------
-- BLOQUEOS PUNTUALES (vacaciones, feriados, imprevistos)
-- ------------------------------------------------------------
create table public.bloqueos_fecha (
  id uuid primary key default gen_random_uuid(),
  start_at timestamptz not null,
  end_at timestamptz not null check (end_at > start_at),
  reason text,
  created_at timestamptz not null default now()
);

-- ------------------------------------------------------------
-- TURNOS RESERVADOS
-- ------------------------------------------------------------
create table public.turnos (
  id uuid primary key default gen_random_uuid(),
  start_at timestamptz not null,
  end_at timestamptz not null check (end_at > start_at),
  servicio_nombre text,
  client_name text not null,
  client_email text not null,
  client_phone text,
  notes text,
  status text not null default 'confirmado' check (status in ('confirmado', 'cancelado')),
  created_at timestamptz not null default now()
);

-- Un mismo horario de inicio no puede tener dos turnos confirmados a la vez.
create unique index turnos_start_at_confirmado_idx on public.turnos (start_at)
  where status = 'confirmado';

create index bloqueos_fecha_range_idx on public.bloqueos_fecha (start_at, end_at);

alter table public.disponibilidad_semanal enable row level security;
alter table public.bloqueos_fecha enable row level security;
alter table public.turnos enable row level security;

create policy "disponibilidad_admin_all" on public.disponibilidad_semanal
  for all using (public.is_admin()) with check (public.is_admin());
create policy "bloqueos_admin_all" on public.bloqueos_fecha
  for all using (public.is_admin()) with check (public.is_admin());
create policy "turnos_admin_all" on public.turnos
  for all using (public.is_admin()) with check (public.is_admin());

-- ------------------------------------------------------------
-- FUNCIONES PÚBLICAS (security definer, no pasan por RLS)
-- ------------------------------------------------------------

-- Devuelve los horarios libres de un día dado, en bloques de p_duration_minutes,
-- descontando bloqueos puntuales y turnos ya confirmados. No expone datos de nadie.
create function public.horarios_disponibles(p_date date, p_duration_minutes integer default 60)
returns table (start_at timestamptz)
language plpgsql
security definer set search_path = public
stable
as $$
declare
  v_weekday smallint := extract(dow from p_date)::smallint;
begin
  return query
  with ventanas as (
    select d.start_time, d.end_time
    from public.disponibilidad_semanal d
    where d.weekday = v_weekday and d.is_active
  ),
  slots as (
    select
      (((p_date + v.start_time) + (n || ' minutes')::interval)
        at time zone 'America/Argentina/Buenos_Aires') as slot_start
    from ventanas v,
      lateral generate_series(
        0,
        (extract(epoch from (v.end_time - v.start_time)) / 60)::int - p_duration_minutes,
        p_duration_minutes
      ) as n
  )
  select s.slot_start
  from slots s
  where not exists (
    select 1 from public.bloqueos_fecha b
    where s.slot_start < b.end_at
      and (s.slot_start + (p_duration_minutes || ' minutes')::interval) > b.start_at
  )
  and not exists (
    select 1 from public.turnos t
    where t.status = 'confirmado'
      and s.slot_start < t.end_at
      and (s.slot_start + (p_duration_minutes || ' minutes')::interval) > t.start_at
  )
  order by s.slot_start;
end;
$$;

grant execute on function public.horarios_disponibles(date, integer) to anon, authenticated;

-- Reserva un turno de forma atómica. El índice único sobre turnos hace de
-- última barrera contra doble reserva por condición de carrera; si el
-- horario se ocupó justo antes, devuelve un error entendible en vez de
-- un error crudo de Postgres.
create function public.reservar_turno(
  p_start_at timestamptz,
  p_duration_minutes integer,
  p_servicio_nombre text,
  p_client_name text,
  p_client_email text,
  p_client_phone text,
  p_notes text
)
returns public.turnos
language plpgsql
security definer set search_path = public
as $$
declare
  v_turno public.turnos;
begin
  begin
    insert into public.turnos (start_at, end_at, servicio_nombre, client_name, client_email, client_phone, notes)
    values (
      p_start_at,
      p_start_at + (p_duration_minutes || ' minutes')::interval,
      p_servicio_nombre,
      p_client_name,
      p_client_email,
      p_client_phone,
      p_notes
    )
    returning * into v_turno;
  exception when unique_violation then
    raise exception 'Ese horario ya no está disponible, elegí otro.';
  end;
  return v_turno;
end;
$$;

grant execute on function public.reservar_turno(timestamptz, integer, text, text, text, text, text) to anon, authenticated;
