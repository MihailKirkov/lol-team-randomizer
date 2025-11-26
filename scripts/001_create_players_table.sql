-- Create players table to store approved players
create table if not exists public.players (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Enable RLS
alter table public.players enable row level security;

-- Anyone can read players (for team randomizer)
create policy "players_select_all"
  on public.players for select
  using (true);

-- Only authenticated users can insert (we'll check admin status in app logic)
create policy "players_insert_authenticated"
  on public.players for insert
  with check (auth.uid() is not null);

-- Only authenticated users can update
create policy "players_update_authenticated"
  on public.players for update
  using (auth.uid() is not null);

-- Only authenticated users can delete
create policy "players_delete_authenticated"
  on public.players for delete
  using (auth.uid() is not null);

-- Create updated_at trigger
create or replace function public.handle_updated_at()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger players_updated_at
  before update on public.players
  for each row
  execute function public.handle_updated_at();
