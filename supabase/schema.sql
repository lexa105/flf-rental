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
  -- NOTE (live schema oddity): the `name` column carries a stray column
  -- default of the literal string 'not null' (i.e. `default 'not null'`)
  -- in addition to its NOT NULL constraint. This looks like a copy/paste
  -- artifact from whoever first created the table rather than intentional
  -- behavior — callers always supply an explicit name, so it has no
  -- observed effect, but leave it in place until a migration deliberately
  -- cleans it up.
  name text not null default 'not null',
  address text,
  is_default boolean default false,
  type text, -- constrained by location_type_check below
  is_primary boolean default false,
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
  quantity int default 1,
  condition text,
  category text,
  notes text
);

-- Row Level Security
alter table public.profile enable row level security;
alter table public.location enable row level security;
alter table public.equipment enable row level security;

-- Profile policies
create policy "Public profiles are viewable by everyone."
  on profile for select
  using ( true );

create policy "Users can insert their own profile."
  on profile for insert
  with check ( auth.uid() = id );

create policy "Users can update own profile."
  on profile for update
  using ( auth.uid() = id );

-- Location policies (owner-only via profile_id)
create policy "Users can view own locations."
  on location for select
  using ( auth.uid() = profile_id );

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
create policy "Equipment is viewable by everyone."
  on equipment for select
  using ( true );

create policy "Users can insert their own equipment."
  on equipment for insert
  with check ( auth.uid() = owner_id );

create policy "Users can update own equipment."
  on equipment for update
  using ( auth.uid() = owner_id );

create policy "Users can delete own equipment."
  on equipment for delete
  using ( auth.uid() = owner_id );

-- Storage: avatars bucket (public read, owner-scoped write) for onboarding
-- Step 1 profile photo upload.
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true);

create policy "Avatar images are publicly accessible."
  on storage.objects for select
  using ( bucket_id = 'avatars' );

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

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
