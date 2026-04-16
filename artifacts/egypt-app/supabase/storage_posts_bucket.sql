-- ── STORAGE BUCKET: posts ──────────────────────────────────────────────────
-- Run this in your Supabase Dashboard → SQL Editor
-- Creates a public "posts" bucket for user-uploaded highlight photos and videos.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'posts',
  'posts',
  true,
  52428800, -- 50 MB
  array[
    'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp',
    'video/mp4', 'video/quicktime', 'video/mov'
  ]
)
on conflict (id) do update set public = true;

-- Anyone can read (public bucket for social feed)
drop policy if exists "posts_objects_select" on storage.objects;
create policy "posts_objects_select" on storage.objects
  for select using (bucket_id = 'posts');

-- Authenticated users can upload
drop policy if exists "posts_objects_insert" on storage.objects;
create policy "posts_objects_insert" on storage.objects
  for insert with check (bucket_id = 'posts' and auth.uid() is not null);

-- Users can delete only their own files (path starts with their uid)
drop policy if exists "posts_objects_delete" on storage.objects;
create policy "posts_objects_delete" on storage.objects
  for delete using (bucket_id = 'posts' and auth.uid()::text = (storage.foldername(name))[1]);
