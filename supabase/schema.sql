-- Habit Tracker Schema
-- Run this in Supabase SQL Editor

-- User profiles (extends auth.users)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  onboarding_complete boolean default false,
  theme text default 'system' check (theme in ('light', 'dark', 'system')),
  timezone text default 'Asia/Beirut',
  reminder_morning_enabled boolean default true,
  reminder_morning_time time default '07:30',
  reminder_evening_enabled boolean default true,
  reminder_evening_time time default '21:00',
  created_at timestamptz default now()
);

alter table public.profiles enable row level security;

create policy "Users can view own profile" on public.profiles
  for select using (auth.uid() = id);
create policy "Users can update own profile" on public.profiles
  for update using (auth.uid() = id);
create policy "Users can insert own profile" on public.profiles
  for insert with check (auth.uid() = id);

-- Rubrics
create table if not exists public.rubrics (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null default 'My Rubric',
  template_source text,
  created_at timestamptz default now()
);

alter table public.rubrics enable row level security;
create policy "Users manage own rubrics" on public.rubrics
  for all using (auth.uid() = user_id);

-- Tiers
create table if not exists public.tiers (
  id uuid primary key default gen_random_uuid(),
  rubric_id uuid not null references public.rubrics(id) on delete cascade,
  label text not null,
  done_pts integer not null default 1,
  attempted_pts integer not null default 0,
  blank_pts integer not null default -1,
  sort_order integer not null default 0,
  color_bg text default '#e8faf0',
  color_accent text default '#27ae60',
  color_text text default '#1e8449'
);

alter table public.tiers enable row level security;
create policy "Users manage own tiers" on public.tiers
  for all using (
    exists (select 1 from public.rubrics r where r.id = rubric_id and r.user_id = auth.uid())
  );

-- Habits
create table if not exists public.habits (
  id uuid primary key default gen_random_uuid(),
  tier_id uuid not null references public.tiers(id) on delete cascade,
  name text not null,
  icon text default '✦',
  type text not null default 'standard' check (type in ('standard', 'text', 'deepwork', 'gym')),
  cadence text not null default 'daily' check (cadence in ('daily', 'weekly')),
  special_config jsonb default '{}',
  sort_order integer not null default 0
);

alter table public.habits enable row level security;
create policy "Users manage own habits" on public.habits
  for all using (
    exists (
      select 1 from public.tiers t
      join public.rubrics r on r.id = t.rubric_id
      where t.id = tier_id and r.user_id = auth.uid()
    )
  );

-- Daily logs
create table if not exists public.daily_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  habit_id uuid not null references public.habits(id) on delete cascade,
  log_date date not null,
  status text check (status in ('done', 'attempted', 'blank')),
  content text,
  deepwork_blocks integer default 0,
  gym_sessions integer,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique (user_id, habit_id, log_date)
);

alter table public.daily_logs enable row level security;
create policy "Users manage own logs" on public.daily_logs
  for all using (auth.uid() = user_id);

create index if not exists daily_logs_user_date_idx on public.daily_logs (user_id, log_date);

-- Push subscriptions (phone notifications)
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
create policy "Users view own reminder log" on public.reminder_sent_log
  for select using (auth.uid() = user_id);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email);
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
