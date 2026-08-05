-- ============================================================
-- El formulario de registro guardaba teléfono y cumpleaños con un
-- UPDATE a profiles hecho desde el navegador justo después del signUp.
-- Con la confirmación por email activada todavía no hay sesión en ese
-- momento, así que auth.uid() es NULL, la policy profiles_update_own
-- bloquea el UPDATE y los datos se perdían en silencio (sin error).
-- Resultado: nadie tenía cumpleaños cargado y el mail de cumpleaños
-- nunca se disparaba para usuarios nuevos.
--
-- Ahora el registro manda todo en la metadata del signUp y el trigger
-- lo copia acá, que corre como security definer y no depende de sesión.
-- ============================================================

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, phone, birth_day, birth_month)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'phone',
    (new.raw_user_meta_data->>'birth_day')::int,
    (new.raw_user_meta_data->>'birth_month')::int
  );
  return new;
end;
$$;

-- Recupera lo que haya quedado en la metadata de usuarios ya registrados
-- pero que no llegó a profiles por el bug de arriba.
update public.profiles p
set
  phone = coalesce(p.phone, u.raw_user_meta_data->>'phone'),
  birth_day = coalesce(p.birth_day, (u.raw_user_meta_data->>'birth_day')::int),
  birth_month = coalesce(p.birth_month, (u.raw_user_meta_data->>'birth_month')::int)
from auth.users u
where p.id = u.id
  and (p.phone is null or p.birth_day is null or p.birth_month is null);
