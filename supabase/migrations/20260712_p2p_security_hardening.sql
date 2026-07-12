-- P2P marketplace groundwork: everything private by default, opt-in sharing,
-- reads restricted to signed-in users, data-hygiene constraints, FK indexes.
-- Idempotent — safe to re-run.

-- ── 1. Equipment: opt-in public sharing (was world-readable) ─────────────────
alter table public.equipment add column if not exists is_public boolean not null default false;

drop policy if exists "Equipment is viewable by everyone." on public.equipment;
drop policy if exists "Equipment is viewable by owner or when public." on public.equipment;
create policy "Equipment is viewable by owner or when public."
  on public.equipment for select
  to authenticated
  using ( auth.uid() = owner_id or is_public );

-- ── 2. Profiles: readable by signed-in users only (blocks anonymous scraping) ─
drop policy if exists "Public profiles are viewable by everyone." on public.profile;
drop policy if exists "Profiles are viewable by signed-in users." on public.profile;
create policy "Profiles are viewable by signed-in users."
  on public.profile for select
  to authenticated
  using ( true );

-- ── 3. Locations: same owner-or-public rule, signed-in users only ────────────
drop policy if exists "Users can view own locations." on public.location;
drop policy if exists "Locations are viewable by owner or when public." on public.location;
create policy "Locations are viewable by owner or when public."
  on public.location for select
  to authenticated
  using ( auth.uid() = profile_id or is_public );

-- ── 4. Data hygiene constraints ───────────────────────────────────────────────
alter table public.equipment drop constraint if exists equipment_status_check;
alter table public.equipment add constraint equipment_status_check
  check ( status in ('available', 'checked-out', 'maintenance', 'missing') or status is null );

alter table public.equipment drop constraint if exists equipment_quantity_check;
alter table public.equipment add constraint equipment_quantity_check
  check ( quantity is null or quantity > 0 );

-- location.name carried a stray literal default of the string 'not null'
alter table public.location alter column name drop default;

-- ── 5. Indexes on FK columns (join/filter performance as data grows) ──────────
create index if not exists location_profile_id_idx  on public.location  (profile_id);
create index if not exists equipment_owner_id_idx   on public.equipment (owner_id);
create index if not exists equipment_location_id_idx on public.equipment (location_id);
create index if not exists equipment_assignee_id_idx on public.equipment (assignee_id);

-- ── 6. Function hardening (per Supabase security advisors) ────────────────────
-- Pin search_path, and stop anon/signed-in users from invoking these
-- SECURITY DEFINER functions via /rest/v1/rpc — they are trigger-only.
alter function public.handle_new_user() set search_path = '';
revoke execute on function public.handle_new_user() from public, anon, authenticated;
revoke execute on function public.rls_auto_enable() from public, anon, authenticated;

-- ── 7. Avatars bucket: cap size, images only, no file listing ─────────────────
update storage.buckets
set file_size_limit = 5242880, -- 5 MB
    allowed_mime_types = array['image/png', 'image/jpeg', 'image/webp', 'image/gif']
where id = 'avatars';

-- Public buckets serve object URLs without a SELECT policy; the broad SELECT
-- policy only enabled listing every file in the bucket (advisor 0025).
drop policy if exists "Avatar images are publicly accessible." on storage.objects;
