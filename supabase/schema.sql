-- 1. Profiles table
create table public.profiles (
  id uuid references auth.users not null primary key,
  full_name text,
  username text unique,
  avatar_url text,
  bio text,
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- 2. Equipment table
create type public.equipment_status as enum ('available', 'loaned', 'maintenance');

create table public.equipment (
  id uuid default gen_random_uuid() primary key,
  owner_id uuid references public.profiles(id) on delete cascade not null,
  category text,
  name text not null,
  serial_number text, -- private/owner-only (handle via RLS)
  image_url text,
  status public.equipment_status default 'available',
  description text,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- 3. Loans table
create table public.loans (
  id uuid default gen_random_uuid() primary key,
  item_id uuid references public.equipment(id) on delete cascade not null,
  borrower_id uuid references public.profiles(id) on delete cascade not null,
  status text check (status in ('pending', 'active', 'returned')) default 'pending',
  start_date timestamp with time zone,
  end_date timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- Set up Row Level Security (RLS)
alter table public.profiles enable row level security;
alter table public.equipment enable row level security;
alter table public.loans enable row level security;

-- Profiles policies
create policy "Public profiles are viewable by everyone."
  on profiles for select
  using ( true );

create policy "Users can insert their own profile."
  on profiles for insert
  with check ( auth.uid() = id );

create policy "Users can update own profile."
  on profiles for update
  using ( auth.uid() = id );

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

-- Trigger to create profile on signup
create function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, avatar_url)
  values (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
