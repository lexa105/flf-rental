-- Per-location public sharing (P2P groundwork): owners choose whether a
-- location is visible to other users. Enforced by RLS, default private.

alter table public.location add column if not exists is_public boolean not null default false;

drop policy if exists "Users can view own locations." on public.location;
drop policy if exists "Locations are viewable by owner or when public." on public.location;
create policy "Locations are viewable by owner or when public."
  on public.location for select
  using ( auth.uid() = profile_id or is_public );
