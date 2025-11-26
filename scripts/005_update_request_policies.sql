-- Update RLS policies to allow unauthenticated users to submit requests
-- Drop existing policies
drop policy if exists "player_requests_select_authenticated" on public.player_requests;
drop policy if exists "player_requests_insert_authenticated" on public.player_requests;

-- Allow anyone to view requests (for checking duplicates)
create policy "player_requests_select_all"
  on public.player_requests for select
  using (true);

-- Allow anyone to insert requests (unauthenticated users can request players)
create policy "player_requests_insert_all"
  on public.player_requests for insert
  with check (true);
