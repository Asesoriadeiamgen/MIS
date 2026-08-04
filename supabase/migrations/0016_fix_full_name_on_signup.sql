-- ============================================================
-- El trigger que crea el perfil al registrarse nunca copiaba el
-- nombre completo (quedaba solo en los metadatos de auth.users),
-- así que todo usuario nuevo aparecía "Sin nombre" en el admin
-- aunque lo hubiera cargado en el formulario de registro.
-- ============================================================

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$;

-- Corrige retroactivamente a los usuarios que ya se registraron
-- con el trigger viejo y quedaron sin nombre en profiles.
update public.profiles p
set full_name = u.raw_user_meta_data->>'full_name'
from auth.users u
where p.id = u.id
  and p.full_name is null
  and u.raw_user_meta_data->>'full_name' is not null;
