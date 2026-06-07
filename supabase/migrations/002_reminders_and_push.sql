-- Run in Supabase SQL Editor (after schema.sql)

alter table public.profiles add column if not exists timezone text default 'Asia/Beirut';
alter table public.profiles add column if not exists reminder_morning_enabled boolean default true;
alter table public.profiles add column if not exists reminder_morning_time time default '07:30';
alter table public.profiles add column if not exists reminder_evening_enabled boolean default true;
alter table public.profiles add column if not exists reminder_evening_time time default '21:00';

create table if not exists public.push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  endpoint text not null,
  p256dh text not null,
  auth text not null,
  created_at timestamptz default now(),
  unique (user_id, endpoint)
);

alter table public.push_subscriptions enable row level security;

drop policy if exists "Users manage own push subs" on public.push_subscriptions;
create policy "Users manage own push subs" on public.push_subscriptions
  for all using (auth.uid() = user_id);

create table if not exists public.reminder_sent_log (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  reminder_type text not null check (reminder_type in ('morning', 'evening')),
  sent_date date not null,
  unique (user_id, reminder_type, sent_date)
);

alter table public.reminder_sent_log enable row level security;

drop policy if exists "Users view own reminder log" on public.reminder_sent_log;
create policy "Users view own reminder log" on public.reminder_sent_log
  for select using (auth.uid() = user_id);
