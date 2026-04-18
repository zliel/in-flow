-- inflow database schema
-- auth: clerk (supabase validates clerk jwts via jwks)
-- note: user_id columns store clerk user ids (strings like "user_xxx")

-- enable uuid extension
create extension if not exists "uuid-ossp";

-- block types: categories of time blocks (deep work, meetings, admin, etc.)
create table public.block_types (
  id uuid default uuid_generate_v4() primary key,
  user_id text not null,  -- clerk user id
  name text not null,
  color text not null default '#6366f1',
  default_energy_required int check (default_energy_required between 1 and 5) not null default 3,
  created_at timestamptz default now()
);

-- blocks: time blocks on the calendar
create table public.blocks (
  id uuid default uuid_generate_v4() primary key,
  user_id text not null,  -- clerk user id
  block_type_id uuid references public.block_types(id) on delete set null,
  title text,
  start_time timestamptz not null,
  end_time timestamptz not null,
  is_recurring boolean default false,
  recurrence_pattern jsonb,
  recurrence_group_id uuid,
  created_at timestamptz default now(),
  check (end_time > start_time)
);

-- energy check-ins: daily energy level tracking
create table public.energy_check_ins (
  id uuid default uuid_generate_v4() primary key,
  user_id text not null,  -- clerk user id
  date date not null,
  energy_level int check (energy_level between 1 and 5) not null,
  created_at timestamptz default now(),
  unique (user_id, date)
);

-- enable row level security
alter table public.block_types enable row level security;
alter table public.blocks enable row level security;
alter table public.energy_check_ins enable row level security;

-- rls policies: users can only access their own data
-- uses auth.jwt() ->> 'sub' to get clerk user id from jwt claims
create policy "users can manage their own block types"
  on public.block_types for all
  using ((select (auth.jwt() ->> 'sub')) = user_id);

create policy "users can manage their own blocks"
  on public.blocks for all
  using ((select (auth.jwt() ->> 'sub')) = user_id);

create policy "users can manage their own energy check-ins"
  on public.energy_check_ins for all
  using ((select (auth.jwt() ->> 'sub')) = user_id);

-- helper function to get current user id from clerk jwt
-- can be used in application code if needed
create or replace function public.current_user_id()
returns text
stable
parallel safe
language sql
as $$
  select (auth.jwt() ->> 'sub')::text;
$$;
