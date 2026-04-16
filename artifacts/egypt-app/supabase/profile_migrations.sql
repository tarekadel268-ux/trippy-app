-- ============================================================
-- Trippy Events — Profile system migrations
-- Paste this entire block in Supabase SQL Editor → Run
-- ============================================================

-- ── PROFILES (extend existing table) ─────────────────────────
-- Add missing columns if they don't exist yet
alter table profiles add column if not exists avatar_url  text;
alter table profiles add column if not exists cover_url   text;
alter table profiles add column if not exists bio         text;
alter table profiles add column if not exists role        text;

-- RLS
alter table profiles enable row level security;

drop policy if exists "profiles_select_all"  on profiles;
create policy "profiles_select_all" on profiles
  for select using (true);

drop policy if exists "profiles_insert_own"  on profiles;
create policy "profiles_insert_own" on profiles
  for insert with check (auth.uid() = id);

drop policy if exists "profiles_update_own"  on profiles;
create policy "profiles_update_own" on profiles
  for update using (auth.uid() = id);


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

drop policy if exists "posts_select_own"  on posts;
create policy "posts_select_own" on posts
  for select using (auth.uid() = user_id);

drop policy if exists "posts_insert_own"  on posts;
create policy "posts_insert_own" on posts
  for insert with check (auth.uid() = user_id);

drop policy if exists "posts_delete_own"  on posts;
create policy "posts_delete_own" on posts
  for delete using (auth.uid() = user_id);


-- ── FOLLOWERS ────────────────────────────────────────────────
create table if not exists followers (
  id           uuid primary key default gen_random_uuid(),
  follower_id  uuid references auth.users(id) on delete cascade,
  following_id uuid references auth.users(id) on delete cascade,
  created_at   timestamptz default now(),
  unique (follower_id, following_id)
);

alter table followers enable row level security;

drop policy if exists "followers_select_own"  on followers;
create policy "followers_select_own" on followers
  for select using (auth.uid() = follower_id or auth.uid() = following_id);

drop policy if exists "followers_insert_own"  on followers;
create policy "followers_insert_own" on followers
  for insert with check (auth.uid() = follower_id);

drop policy if exists "followers_delete_own"  on followers;
create policy "followers_delete_own" on followers
  for delete using (auth.uid() = follower_id);


-- ── MESSAGES ─────────────────────────────────────────────────
create table if not exists messages (
  id          uuid primary key default gen_random_uuid(),
  sender_id   uuid references auth.users(id) on delete cascade,
  receiver_id uuid references auth.users(id) on delete cascade,
  message     text,
  created_at  timestamptz default now()
);

alter table messages enable row level security;

drop policy if exists "messages_select_own"  on messages;
create policy "messages_select_own" on messages
  for select using (auth.uid() = sender_id or auth.uid() = receiver_id);

drop policy if exists "messages_insert_own"  on messages;
create policy "messages_insert_own" on messages
  for insert with check (auth.uid() = sender_id);

drop policy if exists "messages_delete_own"  on messages;
create policy "messages_delete_own" on messages
  for delete using (auth.uid() = sender_id);
