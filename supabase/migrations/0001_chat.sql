-- Supabase schema for chats and messages
-- Run this SQL in your Supabase project

-- enum for message roles
create extension if not exists pgcrypto;

do $$
begin
  if not exists (select 1 from pg_type where typname = 'message_role') then
    create type message_role as enum ('user','system','tool');
  end if;
end
$$;

-- chats table
create table if not exists public.chats (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text,
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  archived_at timestamptz
);

create index if not exists chats_user_id_idx on public.chats (user_id);
create index if not exists chats_updated_at_idx on public.chats (updated_at);

-- chat messages
create table if not exists public.chat_messages (
  id uuid primary key default gen_random_uuid(),
  chat_id uuid not null references public.chats(id) on delete cascade,
  role message_role not null,
  text text,
  parts jsonb default '[]'::jsonb,
  text_tsv tsvector generated always as (
    setweight(to_tsvector('simple', coalesce(text,'')), 'A') ||
    setweight(to_tsvector('simple', coalesce(jsonb_path_query_array(parts, '$[*] ? (@.type == "text").text')::text, '')), 'B')
  ) stored,
  status text check (status in ('final','streaming','error')) default 'final',
  reply_to uuid references public.chat_messages(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists chat_messages_chat_id_created_at_idx on public.chat_messages (chat_id, created_at);
create index if not exists chat_messages_text_tsv_idx on public.chat_messages using gin (text_tsv);
create index if not exists chat_messages_parts_gin on public.chat_messages using gin (parts);

-- optional attachments
create table if not exists public.chat_message_attachments (
  id uuid primary key default gen_random_uuid(),
  message_id uuid not null references public.chat_messages(id) on delete cascade,
  kind text not null check (kind in ('image','audio','file')),
  storage_path text not null,
  mime_type text,
  bytes int,
  width int,
  height int,
  duration_ms int,
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists chat_message_attachments_message_idx on public.chat_message_attachments (message_id);

-- Row Level Security
alter table public.chats enable row level security;
alter table public.chat_messages enable row level security;
alter table public.chat_message_attachments enable row level security;

drop policy if exists chats_is_owner on public.chats;
create policy chats_is_owner on public.chats
for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists messages_in_own_chat on public.chat_messages;
create policy messages_in_own_chat on public.chat_messages
for all
using (exists (
  select 1 from public.chats c where c.id = chat_messages.chat_id and c.user_id = auth.uid()
))
with check (exists (
  select 1 from public.chats c where c.id = chat_messages.chat_id and c.user_id = auth.uid()
));

drop policy if exists attachments_in_own_chat on public.chat_message_attachments;
create policy attachments_in_own_chat on public.chat_message_attachments
for all
using (exists (
  select 1 from public.chat_messages m join public.chats c on c.id = m.chat_id
  where m.id = chat_message_attachments.message_id and c.user_id = auth.uid()
))
with check (exists (
  select 1 from public.chat_messages m join public.chats c on c.id = m.chat_id
  where m.id = chat_message_attachments.message_id and c.user_id = auth.uid()
));



