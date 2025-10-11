-- Add per-user ownership to core tables and enforce via RLS
-- Option A: direct owner column on each table

-- Make sure gen_random_uuid() is available
create extension if not exists pgcrypto;

-- 1) Add user_id columns (nullable to allow backfill if needed)
alter table if exists public.contacts       add column if not exists user_id uuid references auth.users(id) on delete cascade;
alter table if exists public.notes          add column if not exists user_id uuid references auth.users(id) on delete cascade;
alter table if exists public.occupations    add column if not exists user_id uuid references auth.users(id) on delete cascade;
alter table if exists public.organizations  add column if not exists user_id uuid references auth.users(id) on delete cascade;
alter table if exists public.subjects       add column if not exists user_id uuid references auth.users(id) on delete cascade;
alter table if exists public.relationships  add column if not exists user_id uuid references auth.users(id) on delete cascade;
alter table if exists public.sentiments     add column if not exists user_id uuid references auth.users(id) on delete cascade;
alter table if exists public.commitments    add column if not exists user_id uuid references auth.users(id) on delete cascade;

-- 2) Helpful indexes
create index if not exists contacts_user_idx       on public.contacts(user_id);
create index if not exists notes_user_idx          on public.notes(user_id);
create index if not exists occupations_user_idx    on public.occupations(user_id);
create index if not exists organizations_user_idx  on public.organizations(user_id);
create index if not exists subjects_user_idx       on public.subjects(user_id);
create index if not exists relationships_user_idx  on public.relationships(user_id);
create index if not exists sentiments_user_idx     on public.sentiments(user_id);
create index if not exists commitments_user_idx    on public.commitments(user_id);

-- 3) Enable Row Level Security
alter table if exists public.contacts       enable row level security;
alter table if exists public.notes          enable row level security;
alter table if exists public.occupations    enable row level security;
alter table if exists public.organizations  enable row level security;
alter table if exists public.subjects       enable row level security;
alter table if exists public.relationships  enable row level security;
alter table if exists public.sentiments     enable row level security;
alter table if exists public.commitments    enable row level security;

-- 4) Owner policies (drop+create for compatibility)
drop policy if exists contacts_is_owner       on public.contacts;
drop policy if exists notes_is_owner          on public.notes;
drop policy if exists occupations_is_owner    on public.occupations;
drop policy if exists organizations_is_owner  on public.organizations;
drop policy if exists subjects_is_owner       on public.subjects;
drop policy if exists relationships_is_owner  on public.relationships;
drop policy if exists sentiments_is_owner     on public.sentiments;
drop policy if exists commitments_is_owner    on public.commitments;

create policy contacts_is_owner       on public.contacts       for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy notes_is_owner          on public.notes          for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy occupations_is_owner    on public.occupations    for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy organizations_is_owner  on public.organizations  for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy subjects_is_owner       on public.subjects       for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy relationships_is_owner  on public.relationships  for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy sentiments_is_owner     on public.sentiments     for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy commitments_is_owner    on public.commitments    for all using (user_id = auth.uid()) with check (user_id = auth.uid());

-- Note: After adding columns, you can backfill existing rows to a chosen user
-- and optionally set the columns NOT NULL in a follow-up migration.


