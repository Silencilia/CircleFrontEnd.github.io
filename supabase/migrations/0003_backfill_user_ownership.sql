-- Backfill user_id for existing rows and enforce NOT NULL
-- Replace v_user with your test user UUID if needed

do $$
declare
  v_user uuid := 'a5b89ac9-349c-4396-83b3-b61fee1495d1'::uuid;
begin
  -- Ensure the user exists
  if not exists (select 1 from auth.users where id = v_user) then
    raise exception 'User not found in auth.users: %', v_user;
  end if;

  -- Backfill each table where user_id is NULL
  update public.contacts       set user_id = v_user where user_id is null;
  update public.notes          set user_id = v_user where user_id is null;
  update public.occupations    set user_id = v_user where user_id is null;
  update public.organizations  set user_id = v_user where user_id is null;
  update public.subjects       set user_id = v_user where user_id is null;
  update public.relationships  set user_id = v_user where user_id is null;
  update public.sentiments     set user_id = v_user where user_id is null;
  update public.commitments    set user_id = v_user where user_id is null;

  -- Enforce NOT NULL after backfill
  alter table if exists public.contacts       alter column user_id set not null;
  alter table if exists public.notes          alter column user_id set not null;
  alter table if exists public.occupations    alter column user_id set not null;
  alter table if exists public.organizations  alter column user_id set not null;
  alter table if exists public.subjects       alter column user_id set not null;
  alter table if exists public.relationships  alter column user_id set not null;
  alter table if exists public.sentiments     alter column user_id set not null;
  alter table if exists public.commitments    alter column user_id set not null;
end
$$;


