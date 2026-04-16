-- ============================================================
-- Trippy Events — FULL schema migration (run this once)
-- Supabase Dashboard → SQL Editor → New query → paste → Run
-- Safe to re-run: all statements use IF NOT EXISTS / IF EXISTS
-- ============================================================


-- ── PROFILES ─────────────────────────────────────────────────
create table if not exists profiles (
  id                  uuid primary key references auth.users(id) on delete cascade,
  username            text unique,
  name                text,
  email               text,
  role                text,
  nationality         text,
  phone               text,
  is_verified         boolean default false,
  currency            text default 'USD',
  followed_organizers jsonb default '[]',
  auth_provider       text,
  bio                 text,
  avatar_url          text,
  cover_url           text,
  created_at          timestamptz default now()
);

alter table profiles enable row level security;

drop policy if exists "profiles_select_all" on profiles;
create policy "profiles_select_all" on profiles
  for select using (true);

drop policy if exists "profiles_insert_own" on profiles;
create policy "profiles_insert_own" on profiles
  for insert with check (auth.uid() = id);

drop policy if exists "profiles_update_own" on profiles;
create policy "profiles_update_own" on profiles
  for update using (auth.uid() = id);


-- ── TRIPS ─────────────────────────────────────────────────────
create table if not exists trips (
  id               text primary key,
  user_id          uuid references auth.users(id) on delete cascade,
  organizer_id     text,
  planner_name     text,
  planner_phone    text,
  planner_verified boolean default false,
  city             text,
  title            text,
  description      text,
  price_usd        numeric default 0,
  price_egp        numeric default 0,
  days             integer default 1,
  view_count       integer default 0,
  image_url        text,
  photos           jsonb default '[]',
  includes         jsonb default '[]',
  created_at       timestamptz default now()
);

alter table trips add column if not exists user_id uuid references auth.users(id) on delete cascade;
alter table trips enable row level security;

drop policy if exists "trips_select_own" on trips;
create policy "trips_select_own" on trips
  for select using (auth.uid() = user_id);

drop policy if exists "trips_insert_own" on trips;
create policy "trips_insert_own" on trips
  for insert with check (auth.uid() = user_id);

drop policy if exists "trips_update_own" on trips;
create policy "trips_update_own" on trips
  for update using (auth.uid() = user_id);

drop policy if exists "trips_delete_own" on trips;
create policy "trips_delete_own" on trips
  for delete using (auth.uid() = user_id);


-- ── EVENTS ────────────────────────────────────────────────────
create table if not exists events (
  id               text primary key,
  user_id          uuid references auth.users(id) on delete cascade,
  organizer_id     text,
  holder_name      text,
  holder_phone     text,
  holder_contact   text,
  category         text,
  title            text,
  description      text,
  venue            text,
  date             text,
  price_usd        numeric default 0,
  price_egp        numeric default 0,
  view_count       integer default 0,
  image_url        text,
  photos           jsonb default '[]',
  created_at       timestamptz default now()
);

alter table events add column if not exists user_id uuid references auth.users(id) on delete cascade;
alter table events enable row level security;

drop policy if exists "events_select_own" on events;
create policy "events_select_own" on events
  for select using (auth.uid() = user_id);

drop policy if exists "events_insert_own" on events;
create policy "events_insert_own" on events
  for insert with check (auth.uid() = user_id);

drop policy if exists "events_update_own" on events;
create policy "events_update_own" on events
  for update using (auth.uid() = user_id);

drop policy if exists "events_delete_own" on events;
create policy "events_delete_own" on events
  for delete using (auth.uid() = user_id);


-- ── TICKETS ───────────────────────────────────────────────────
create table if not exists tickets (
  id             text primary key,
  user_id        uuid references auth.users(id) on delete cascade,
  event_id       text,
  event_title    text,
  quantity       integer default 1,
  price_usd      numeric default 0,
  price_egp      numeric default 0,
  payment_method text,
  purchased_at   timestamptz default now()
);

alter table tickets add column if not exists user_id uuid references auth.users(id) on delete cascade;
alter table tickets enable row level security;

drop policy if exists "tickets_select_own" on tickets;
create policy "tickets_select_own" on tickets
  for select using (auth.uid() = user_id);

drop policy if exists "tickets_insert_own" on tickets;
create policy "tickets_insert_own" on tickets
  for insert with check (auth.uid() = user_id);

drop policy if exists "tickets_delete_own" on tickets;
create policy "tickets_delete_own" on tickets
  for delete using (auth.uid() = user_id);


-- ── POSTS (highlights / photo posts) ─────────────────────────
create table if not exists posts (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid references auth.users(id) on delete cascade,
  image_url  text,
  caption    text,
  type       text default 'photo',
  created_at timestamptz default now()
);

alter table posts enable row level security;

drop policy if exists "posts_select_own" on posts;
create policy "posts_select_own" on posts
  for select using (auth.uid() = user_id);

drop policy if exists "posts_insert_own" on posts;
create policy "posts_insert_own" on posts
  for insert with check (auth.uid() = user_id);

drop policy if exists "posts_delete_own" on posts;
create policy "posts_delete_own" on posts
  for delete using (auth.uid() = user_id);


-- ── FOLLOWERS ─────────────────────────────────────────────────
-- follower_id = UUID of the logged-in auth user
-- following_id = TEXT organizer ID (e.g. "org_user_abc123") — NOT a FK
--   because organizers are not always auth users
create table if not exists followers (
  id           uuid primary key default gen_random_uuid(),
  follower_id  uuid references auth.users(id) on delete cascade,
  following_id text not null,
  created_at   timestamptz default now(),
  unique (follower_id, following_id)
);

alter table followers enable row level security;

drop policy if exists "followers_select_own" on followers;
create policy "followers_select_own" on followers
  for select using (auth.uid() = follower_id);

drop policy if exists "followers_insert_own" on followers;
create policy "followers_insert_own" on followers
  for insert with check (auth.uid() = follower_id);

drop policy if exists "followers_delete_own" on followers;
create policy "followers_delete_own" on followers
  for delete using (auth.uid() = follower_id);


-- ── MESSAGES ──────────────────────────────────────────────────
create table if not exists messages (
  id               uuid primary key default gen_random_uuid(),
  sender_id        uuid references auth.users(id) on delete cascade,
  receiver_id      uuid references auth.users(id) on delete cascade,
  thread_id        text,
  listing_id       text,
  listing_title    text,
  participant_name text,
  message          text,
  created_at       timestamptz default now()
);

-- add extra columns if table already existed from an older migration
alter table messages add column if not exists thread_id        text;
alter table messages add column if not exists listing_id       text;
alter table messages add column if not exists listing_title    text;
alter table messages add column if not exists participant_name text;

alter table messages enable row level security;

drop policy if exists "messages_select_own" on messages;
create policy "messages_select_own" on messages
  for select using (auth.uid() = sender_id or auth.uid() = receiver_id);

drop policy if exists "messages_insert_own" on messages;
create policy "messages_insert_own" on messages
  for insert with check (auth.uid() = sender_id);

drop policy if exists "messages_delete_own" on messages;
create policy "messages_delete_own" on messages
  for delete using (auth.uid() = sender_id);


-- ── AUTO-CREATE PROFILE ON SIGNUP (trigger) ───────────────────
-- This runs server-side when a new auth user is created.
-- It bypasses RLS so it works even when email confirmation is required
-- and the client session is not yet established.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, username, name, auth_provider, created_at)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'auth_provider', 'email'),
    now()
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
