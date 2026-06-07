-- Journal notes (quotes, reminders, things to remember)
create table if not exists public.journal_notes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  content text not null,
  note_date date not null default (timezone('Asia/Beirut', now()))::date,
  created_at timestamptz default now()
);

create index if not exists journal_notes_user_date_idx
  on public.journal_notes (user_id, note_date desc);

alter table public.journal_notes enable row level security;

drop policy if exists "Users manage own journal notes" on public.journal_notes;
create policy "Users manage own journal notes" on public.journal_notes
  for all using (auth.uid() = user_id);
