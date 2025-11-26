-- Seed script to create the first admin user
-- NOTE: You'll need to sign up with this email first, then run this script
-- For demo purposes, we'll use a common admin email
-- Replace 'admin@example.com' with your actual admin email

-- First, insert a dummy admin to bootstrap (this will be updated after first signup)
-- This is a placeholder - the real admin will be created after they sign up
insert into public.admin_profiles (id, email, is_admin)
values 
  ('00000000-0000-0000-0000-000000000000', 'admin@example.com', true)
on conflict (id) do nothing;

-- Note: After signing up as admin@example.com, you'll need to run this:
-- update public.admin_profiles set id = (select id from auth.users where email = 'admin@example.com') where email = 'admin@example.com';
