-- This file documents the LIVE Supabase schema (verified via the Supabase
-- MCP against the live project on 2026-07-12). It is a snapshot for
-- reference, not something you run directly — actual schema changes go
-- through new files in supabase/migrations/.

-- 1. Profile table (singular — not "profiles")
create table public.profile (
  id uuid references auth.users not null primary key,
  username text unique,
  avatar_url text,
  first_name text,
  last_name text,
  onboarding_complete boolean default false,
  created_at timestamptz default timezone('utc', now()),
  display_name text,
  pronouns text,
  job_title text,
  bio text
);

-- 2. Location table (singular — not "locations"; links via profile_id)
create table public.location (
  id uuid default gen_random_uuid() primary key,
  profile_id uuid not null references public.profile(id),
  name text not null,
  address text,
  is_default boolean default false,
  type text, -- constrained by location_type_check below
  is_primary boolean default false,
  is_public boolean not null default false,
  created_at timestamptz default now()
);

alter table public.location add constraint location_type_check
  check ( type in ('studio', 'home-studio', 'remote', 'office', 'other') or type is null );

-- 3. Equipment table
create table public.equipment (
  id uuid default gen_random_uuid() primary key,
  created_at timestamptz default now(),
  name text,
  status text,
  owner_id uuid not null default auth.uid() references auth.users(id),
  image_url text,
  location_id uuid references public.location(id),
  assignee_id uuid references public.profile(id),
  quantity int default 1, -- constrained > 0 by equipment_quantity_check
  condition text,
  category text,
  notes text,
  is_public boolean not null default false
);

alter table public.equipment add constraint equipment_status_check
  check ( status in ('available', 'checked-out', 'maintenance', 'missing') or status is null );
alter table public.equipment add constraint equipment_quantity_check
  check ( quantity is null or quantity > 0 );

-- Indexes on FK columns
create index location_profile_id_idx   on public.location  (profile_id);
create index equipment_owner_id_idx    on public.equipment (owner_id);
create index equipment_location_id_idx on public.equipment (location_id);
create index equipment_assignee_id_idx on public.equipment (assignee_id);

-- Row Level Security
alter table public.profile enable row level security;
alter table public.location enable row level security;
alter table public.equipment enable row level security;

-- Visibility model (P2P groundwork): everything is private by default and
-- reads require a signed-in user; owners opt in per row via is_public.

-- Profile policies
create policy "Profiles are viewable by signed-in users."
  on profile for select
  to authenticated
  using ( true );

create policy "Users can insert their own profile."
  on profile for insert
  with check ( auth.uid() = id );

create policy "Users can update own profile."
  on profile for update
  using ( auth.uid() = id );

-- Location policies
create policy "Locations are viewable by owner or when public."
  on location for select
  to authenticated
  using ( auth.uid() = profile_id or is_public );

create policy "Users can insert own locations."
  on location for insert
  with check ( auth.uid() = profile_id );

create policy "Users can update own locations."
  on location for update
  using ( auth.uid() = profile_id );

create policy "Users can delete own locations."
  on location for delete
  using ( auth.uid() = profile_id );

-- Equipment policies
create policy "Equipment is viewable by owner or when public."
  on equipment for select
  to authenticated
  using ( auth.uid() = owner_id or is_public );

create policy "Users can insert their own equipment."
  on equipment for insert
  with check ( auth.uid() = owner_id );

create policy "Users can update own equipment."
  on equipment for update
  using ( auth.uid() = owner_id );

create policy "Users can delete own equipment."
  on equipment for delete
  using ( auth.uid() = owner_id );

-- Storage: avatars bucket for onboarding Step 1 profile photo upload.
-- Public bucket = object URLs are world-readable, but there is deliberately
-- NO select policy on storage.objects: that would allow listing every file
-- (Supabase advisor 0025). 5 MB cap, images only.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('avatars', 'avatars', true, 5242880,
        array['image/png', 'image/jpeg', 'image/webp', 'image/gif']);

create policy "Users can upload their own avatar."
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Users can update their own avatar."
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Users can delete their own avatar."
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- Trigger: creates a `profile` row on signup, sourcing first/last name from
-- the auth metadata that src/lib/auth/actions.ts's signup() sets.
create function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profile (id, first_name, last_name, onboarding_complete)
  values (
    new.id,
    new.raw_user_meta_data->>'first_name',
    new.raw_user_meta_data->>'last_name',
    false
  );
  return new;
end;
$$ language plpgsql security definer;

-- Hardening: pinned search_path; not callable via /rest/v1/rpc (trigger-only).
alter function public.handle_new_user() set search_path = '';
revoke execute on function public.handle_new_user() from public, anon, authenticated;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
