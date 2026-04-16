-- Post reports table: each row = one user reporting one post.
-- View all reports in Supabase Dashboard → Table Editor → post_reports
create table if not exists public.post_reports (
  id uuid primary key default gen_random_uuid(),
  post_id uuid references public.posts(id) on delete cascade,
  reported_user_id uuid not null,
  reported_image_url text not null,
  reporter_id uuid not null,
  reason text,
  created_at timestamptz not null default now()
);

create index if not exists post_reports_created_at_idx on public.post_reports (created_at desc);
create index if not exists post_reports_reported_user_idx on public.post_reports (reported_user_id);

alter table public.post_reports enable row level security;

-- Anyone signed in can insert a report (must be themselves as reporter)
drop policy if exists "post_reports_insert_authenticated" on public.post_reports;
create policy "post_reports_insert_authenticated"
  on public.post_reports for insert
  to authenticated
  with check (auth.uid() = reporter_id);

-- A user can see only their own reports (admin views in Dashboard with service role)
drop policy if exists "post_reports_select_own" on public.post_reports;
create policy "post_reports_select_own"
  on public.post_reports for select
  to authenticated
  using (auth.uid() = reporter_id);
