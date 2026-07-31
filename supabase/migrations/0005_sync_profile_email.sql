-- Mantiene profiles.email sincronizado con auth.users.email cuando un usuario
-- confirma un cambio de email (flujo de doble opt-in de Supabase Auth), sin
-- importar si el cambio lo hizo el propio usuario o un admin.
create function public.handle_user_email_change()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  if new.email is distinct from old.email then
    update public.profiles set email = new.email where id = new.id;
  end if;
  return new;
end;
$$;

create trigger on_auth_user_email_updated
  after update of email on auth.users
  for each row execute procedure public.handle_user_email_change();
