-- UniFantasy · Batch 3 — user profiles
-- Run once in Supabase → SQL Editor (or `supabase db push`).
--
-- Security model
--   * auth.users is managed by Supabase Auth (passwords are hashed there; this
--     app never sees or stores them).
--   * public.profiles holds preferences only. Row Level Security limits every
--     read/write to the signed-in user's own row (auth.uid() = id).
--   * Rows are created by a trigger on sign-up; users cannot insert rows for
--     anyone else, cannot change their id, and cannot delete (deleting the
--     auth user cascades).

create table if not exists public.profiles (
  id                       uuid primary key references auth.users (id) on delete cascade,
  display_name             text check (display_name is null or char_length(display_name) between 1 and 40),
  favorite_sports          text[] not null default '{}'
                           check (favorite_sports <@ array['nba','nfl','soccer','mlb','nhl','euroleague']),
  home_universe            text not null default 'all'
                           check (home_universe in ('all','nba','nfl','soccer','mlb','nhl','euroleague')),
  platforms                text[] not null default '{}'
                           check (platforms <@ array['espn','yahoo','sleeper','nflfantasy','fpl','fantrax','cbs','elfantasy']),
  formats                  text[] not null default '{}'
                           check (formats <@ array['h2h_points','h2h_categories','roto','points','ppr','half_ppr','standard',
                                                   'classic','draft','best_ball','dynasty','daily']),
  time_zone                text not null default 'UTC' check (char_length(time_zone) between 1 and 64),
  language                 text not null default 'en' check (language in ('en','es','fr','de','it','pt','el','tr')),
  notifications            jsonb not null default '{"lineup":true,"injury":true,"trades":true,"news":false,"recap":true}'::jsonb
                           check (jsonb_typeof(notifications) = 'object'),
  onboarding_step          smallint not null default 0 check (onboarding_step between 0 and 4),
  onboarding_completed_at  timestamptz,
  created_at               timestamptz not null default now(),
  updated_at               timestamptz not null default now()
);

alter table public.profiles enable row level security;

-- Own row only. `(select auth.uid())` is evaluated once per query (faster).
drop policy if exists "profiles: read own" on public.profiles;
create policy "profiles: read own" on public.profiles
  for select to authenticated
  using ((select auth.uid()) = id);

drop policy if exists "profiles: insert own" on public.profiles;
create policy "profiles: insert own" on public.profiles
  for insert to authenticated
  with check ((select auth.uid()) = id);

drop policy if exists "profiles: update own" on public.profiles;
create policy "profiles: update own" on public.profiles
  for update to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

-- No DELETE policy: rows go away only when the auth user is deleted (cascade).
-- Anonymous visitors get nothing.
revoke all on public.profiles from anon;

-- Keep updated_at fresh and stop clients from rewriting server-owned columns.
create or replace function public.profiles_before_update()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.id := old.id;
  new.created_at := old.created_at;
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists profiles_before_update on public.profiles;
create trigger profiles_before_update
  before update on public.profiles
  for each row execute function public.profiles_before_update();

-- Create the profile row when someone signs up (email or Google).
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  raw_name text := coalesce(new.raw_user_meta_data ->> 'display_name', new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name');
begin
  insert into public.profiles (id, display_name)
  values (
    new.id,
    nullif(left(regexp_replace(coalesce(trim(raw_name), ''), '[<>]', '', 'g'), 40), '')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
