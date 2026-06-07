-- Phase 2: habit roles, MVD threshold, reduced blank penalties

-- Dedicated role column (replaces special_config.role + name fallback)
alter table public.habits
  add column if not exists role text
  check (role is null or role in ('mit', 'highlight'));

update public.habits
set role = special_config->>'role'
where special_config->>'role' in ('mit', 'highlight')
  and role is null;

-- Minimum viable day threshold (default +10)
alter table public.profiles
  add column if not exists mvd_threshold integer not null default 10;

-- Backfill reduced blank penalties for existing rubrics
update public.tiers set blank_pts = 0  where upper(label) like 'EASY%';
update public.tiers set blank_pts = -1 where upper(label) like 'MEDIUM%';
update public.tiers set blank_pts = -1 where upper(label) = 'HARD';
update public.tiers set blank_pts = -2 where upper(label) like 'HARD+%';
update public.tiers set blank_pts = -3 where upper(label) like 'FAJR%';
