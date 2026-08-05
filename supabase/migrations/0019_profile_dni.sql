-- ============================================================
-- DNI en el perfil, para usarlo en las compras (facturación).
-- Se guarda como texto: puede tener puntos y no se opera con él.
-- ============================================================

alter table public.profiles add column if not exists dni text;

-- El trigger tiene que copiarlo del alta igual que el resto de los datos;
-- si no, se perdería como pasaba antes con teléfono y cumpleaños.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, phone, dni, birth_day, birth_month)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'phone',
    new.raw_user_meta_data->>'dni',
    (new.raw_user_meta_data->>'birth_day')::int,
    (new.raw_user_meta_data->>'birth_month')::int
  );
  return new;
end;
$$;
