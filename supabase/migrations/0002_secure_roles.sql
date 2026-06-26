-- 0002_secure_roles.sql
-- Role is server-controlled. Clients can never choose or change a role.
-- Idempotent: safe to run more than once (also doubles as the script to paste
-- into the Supabase SQL editor).

-- Base type + table (no-ops if already present from 0001) ---------------------
do $$ begin
  create type public.user_role as enum ('student', 'mentor', 'admin', 'superadmin');
exception when duplicate_object then null; end $$;

create table if not exists public.users (
  id         uuid primary key references auth.users (id) on delete cascade,
  role       public.user_role not null default 'student',
  full_name  text,
  email      text unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.users enable row level security;

-- updated_at maintenance ------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end; $$;

drop trigger if exists users_set_updated_at on public.users;
create trigger users_set_updated_at
  before update on public.users
  for each row execute function public.set_updated_at();

-- New signups ALWAYS become 'student'. Any client-supplied role is ignored. ----
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.users (id, email, full_name, role)
  values (new.id, new.email, coalesce(new.raw_user_meta_data ->> 'full_name', ''), 'student')
  on conflict (id) do nothing;
  return new;
end; $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Role lookup helper (security definer avoids RLS recursion) -------------------
create or replace function public.current_user_role()
returns public.user_role language sql stable security definer set search_path = public as $$
  select role from public.users where id = auth.uid();
$$;

-- Block normal logged-in users from changing ANY role. Admins and the server
-- (service_role / SQL editor) are allowed. ------------------------------------
create or replace function public.prevent_role_change()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.role is distinct from old.role
     and coalesce(auth.role(), '') = 'authenticated'
     and public.current_user_role() not in ('admin', 'superadmin') then
    raise exception 'Only admins can change roles';
  end if;
  return new;
end; $$;

drop trigger if exists users_prevent_role_change on public.users;
create trigger users_prevent_role_change
  before update on public.users
  for each row execute function public.prevent_role_change();

-- RLS policies ----------------------------------------------------------------
drop policy if exists users_select_own on public.users;
create policy users_select_own on public.users
  for select using (auth.uid() = id);

drop policy if exists users_update_own on public.users;
create policy users_update_own on public.users
  for update using (auth.uid() = id) with check (auth.uid() = id);

drop policy if exists users_select_admin on public.users;
create policy users_select_admin on public.users
  for select using (public.current_user_role() in ('admin', 'superadmin'));

-- Backfill profile rows for any auth users created before this ran ------------
insert into public.users (id, email, full_name, role)
select u.id, u.email, coalesce(u.raw_user_meta_data ->> 'full_name', ''), 'student'
from auth.users u
left join public.users p on p.id = u.id
where p.id is null;
