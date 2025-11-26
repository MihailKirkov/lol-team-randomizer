-- Create admin profiles table to track who is an admin
create table if not exists public.admin_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  is_admin boolean default true,
  created_at timestamptz default now()
);

-- Enable RLS
alter table public.admin_profiles enable row level security;

-- Only admins can read admin profiles (self-referential check)
create policy "admin_profiles_select_admin"
  on public.admin_profiles for select
  using (auth.uid() in (select id from public.admin_profiles where is_admin = true));

-- Only existing admins can insert new admins
create policy "admin_profiles_insert_admin"
  on public.admin_profiles for insert
  with check (auth.uid() in (select id from public.admin_profiles where is_admin = true));

-- Only existing admins can update admin profiles
create policy "admin_profiles_update_admin"
  on public.admin_profiles for update
  using (auth.uid() in (select id from public.admin_profiles where is_admin = true));

-- Only existing admins can delete admin profiles
create policy "admin_profiles_delete_admin"
  on public.admin_profiles for delete
  using (auth.uid() in (select id from public.admin_profiles where is_admin = true));
