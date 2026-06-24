-- =============================================================
--  Jesus Rest — Comments & Testimonies
--  Run this ONCE in your Supabase project:
--    Supabase dashboard  ->  SQL Editor  ->  New query
--    paste this whole file, click RUN.
-- =============================================================

create table if not exists public.entries (
  id            uuid primary key default gen_random_uuid(),
  type          text not null check (type in ('comment','testimony')),
  article_slug  text,                       -- which article (null for a general testimony)
  author_id     uuid references auth.users(id) on delete set null,
  author_name   text not null,
  body          text not null,
  status        text not null default 'approved'
                 check (status in ('approved','pending','rejected')),
  created_at    timestamptz not null default now()
);

create index if not exists entries_slug_idx on public.entries (article_slug, created_at);
create index if not exists entries_type_idx on public.entries (type, created_at);

-- Row Level Security: the public may READ approved entries only.
-- Nobody can INSERT directly — only our server function (service role) may write,
-- and it only writes AFTER the AI moderation gate approves a post.
alter table public.entries enable row level security;

drop policy if exists "read approved" on public.entries;
create policy "read approved"
  on public.entries for select
  using (status = 'approved');

-- (No insert/update/delete policies = blocked for everyone except the service role.)
