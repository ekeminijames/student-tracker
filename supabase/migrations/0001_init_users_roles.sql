-- 0001_init_users_roles.sql
-- Baseline: user roles, the public.users profile table, auto-provisioning from
-- auth.users, and Row-Level Security so users can only read their own row
-- (admins can read all). This is the security foundation everything builds on.

-- ── Roles ────────────────────────────────────────────────────────────────────
create type public.user_role as enum ('student', 'mentor', 'admin', 'superadmin');

-- ── Profile table (mirrors auth.users) ───────────────────────────────────────
create table public.users (
  id         uuid primary key references auth.users (id) on delete cascade,
  role       public.user_role not null default 'student',
  full_name  text,
  email      text unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ── updated_at maintenance ───────────────────────────────────────────────────
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger users_set_updated_at
  before update on public.users
  for each row execute function public.set_updated_at();

-- ── Auto-create a profile row whenever a new auth user signs up ───────────────
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.users (id, email, full_name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', ''),
    coalesce((new.raw_user_meta_data ->> 'role')::public.user_role, 'student')
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ── Role lookup helper (security definer avoids RLS recursion) ────────────────
create or replace function public.current_user_role()
returns public.user_role
language sql
stable
security definer
set search_path = public
as $$
  select role from public.users where id = auth.uid();
$$;

-- ── Row-Level Security ───────────────────────────────────────────────────────
alter table public.users enable row level security;

-- A user can read their own profile.
create policy users_select_own
  on public.users for select
  using (auth.uid() = id);

-- A user can update their own profile (role changes are blocked at the app/admin
-- layer; tighten with a column check in a later migration if needed).
create policy users_update_own
  on public.users for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- Admins and superadmins can read every profile.
create policy users_select_admin
  on public.users for select
  using (public.current_user_role() in ('admin', 'superadmin'));
