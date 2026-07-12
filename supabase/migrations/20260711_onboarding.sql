-- Corrective migration for the LIVE Supabase schema (singular table names:
-- profile / location / equipment). A prior migration targeted plural tables
-- (profiles/locations) that were never applied to the live DB — this
-- migration replaces that attempt. Idempotent — safe to re-run.

-- 1. Profile: new column collected by onboarding Step 1.
alter table public.profile add column if not exists bio text;

-- 2. Location: new columns collected by onboarding Step 2.
alter table public.location add column if not exists type text;
alter table public.location add column if not exists is_primary boolean default false;

alter table public.location drop constraint if exists location_type_check;
alter table public.location add constraint location_type_check
  check ( type in ('studio', 'home-studio', 'remote', 'office', 'other') or type is null );

-- 3. Equipment: new columns collected by onboarding Step 3.
alter table public.equipment add column if not exists category text;
alter table public.equipment add column if not exists notes text;

-- 4. Row Level Security.
alter table public.profile enable row level security;
alter table public.location enable row level security;
alter table public.equipment enable row level security;

-- Profile policies
drop policy if exists "Public profiles are viewable by everyone." on public.profile;
create policy "Public profiles are viewable by everyone."
  on public.profile for select
  using ( true );

drop policy if exists "Users can insert their own profile." on public.profile;
create policy "Users can insert their own profile."
  on public.profile for insert
  with check ( auth.uid() = id );

drop policy if exists "Users can update own profile." on public.profile;
create policy "Users can update own profile."
  on public.profile for update
  using ( auth.uid() = id );

-- Location policies (owner-only via profile_id)
drop policy if exists "Users can view own locations." on public.location;
create policy "Users can view own locations."
  on public.location for select
  using ( auth.uid() = profile_id );

drop policy if exists "Users can insert own locations." on public.location;
create policy "Users can insert own locations."
  on public.location for insert
  with check ( auth.uid() = profile_id );

drop policy if exists "Users can update own locations." on public.location;
create policy "Users can update own locations."
  on public.location for update
  using ( auth.uid() = profile_id );

drop policy if exists "Users can delete own locations." on public.location;
create policy "Users can delete own locations."
  on public.location for delete
  using ( auth.uid() = profile_id );

-- Equipment policies
drop policy if exists "Equipment is viewable by everyone." on public.equipment;
create policy "Equipment is viewable by everyone."
  on public.equipment for select
  using ( true );

drop policy if exists "Users can insert their own equipment." on public.equipment;
create policy "Users can insert their own equipment."
  on public.equipment for insert
  with check ( auth.uid() = owner_id );

drop policy if exists "Users can update own equipment." on public.equipment;
create policy "Users can update own equipment."
  on public.equipment for update
  using ( auth.uid() = owner_id );

drop policy if exists "Users can delete own equipment." on public.equipment;
create policy "Users can delete own equipment."
  on public.equipment for delete
  using ( auth.uid() = owner_id );

-- 5. Storage: avatars bucket for onboarding Step 1 profile photo upload.
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

drop policy if exists "Avatar images are publicly accessible." on storage.objects;
create policy "Avatar images are publicly accessible."
  on storage.objects for select
  using ( bucket_id = 'avatars' );

drop policy if exists "Users can upload their own avatar." on storage.objects;
create policy "Users can upload their own avatar."
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "Users can update their own avatar." on storage.objects;
create policy "Users can update their own avatar."
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "Users can delete their own avatar." on storage.objects;
create policy "Users can delete their own avatar."
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- OPTIONAL CLEANUP: stray table from an earlier experiment (empty). Skip this line to keep it.
drop table if exists public.locations;
