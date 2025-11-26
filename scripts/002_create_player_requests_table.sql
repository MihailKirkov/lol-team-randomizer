-- Create player_requests table for user-submitted player requests
create table if not exists public.player_requests (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  requested_by uuid references auth.users(id) on delete set null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Enable RLS
alter table public.player_requests enable row level security;

-- Anyone can read their own requests or all requests if authenticated
create policy "player_requests_select_authenticated"
  on public.player_requests for select
  using (auth.uid() is not null);

-- Anyone authenticated can insert a request
create policy "player_requests_insert_authenticated"
  on public.player_requests for insert
  with check (auth.uid() is not null);

-- Only authenticated users can update (admin check in app)
create policy "player_requests_update_authenticated"
  on public.player_requests for update
  using (auth.uid() is not null);

-- Only authenticated users can delete
create policy "player_requests_delete_authenticated"
  on public.player_requests for delete
  using (auth.uid() is not null);

-- Create updated_at trigger
create trigger player_requests_updated_at
  before update on public.player_requests
  for each row
  execute function public.handle_updated_at();
