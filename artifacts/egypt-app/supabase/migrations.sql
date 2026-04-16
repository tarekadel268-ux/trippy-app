-- ============================================================
-- Trippy Events — Supabase schema + RLS migrations
-- Run this entire file in your Supabase SQL editor:
--   https://supabase.com/dashboard → SQL Editor → New query
-- ============================================================

-- ── TRIPS ────────────────────────────────────────────────────
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

-- add user_id column if table already existed without it
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


-- ── EVENTS ───────────────────────────────────────────────────
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


-- ── TICKETS ──────────────────────────────────────────────────
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
