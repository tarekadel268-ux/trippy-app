-- ============================================================
-- RLS FIX: Make marketplace content publicly readable
-- Run this in Supabase Dashboard → SQL Editor → New query
-- Safe to re-run (uses DROP IF EXISTS before each CREATE)
-- ============================================================

-- ── TRIPS: public marketplace discovery ──────────────────────
drop policy if exists "trips_select_own" on trips;
drop policy if exists "trips_select_all" on trips;
create policy "trips_select_all" on trips
  for select using (true);

-- ── EVENTS: public marketplace discovery ─────────────────────
drop policy if exists "events_select_own" on events;
drop policy if exists "events_select_all" on events;
create policy "events_select_all" on events
  for select using (true);

-- ── POSTS: social feed (followed users' highlights) ──────────
drop policy if exists "posts_select_own" on posts;
drop policy if exists "posts_select_all" on posts;
create policy "posts_select_all" on posts
  for select using (true);

-- ── TICKETS: public read at DB level; app filters by user ────
drop policy if exists "tickets_select_own" on tickets;
drop policy if exists "tickets_select_all" on tickets;
create policy "tickets_select_all" on tickets
  for select using (true);

-- ── Verify the new policies are in place ─────────────────────
select tablename, policyname, cmd, qual
from pg_policies
where tablename in ('trips', 'events', 'posts', 'tickets')
order by tablename, cmd;
