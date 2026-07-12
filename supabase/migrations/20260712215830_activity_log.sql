-- Per-item activity log: immutable, owner-only (private by default per project policy).
create table public.activity (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  owner_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  equipment_id uuid references public.equipment(id) on delete set null,
  item_name text not null,
  item_code text,
  type text not null check (type in ('checkout','checkin','maintenance','missing','added','deleted')),
  note text
);

alter table public.activity enable row level security;

create policy "activity_select_own" on public.activity
  for select using (auth.uid() = owner_id);

create policy "activity_insert_own" on public.activity
  for insert with check (auth.uid() = owner_id);

create index activity_owner_created_idx on public.activity (owner_id, created_at desc);
create index activity_equipment_idx on public.activity (equipment_id);
