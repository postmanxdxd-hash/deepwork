# Deep Work — Habit Tracker Architecture

Personalized habit tracking web app with points-based scoring, streaks, journal notes, and cloud sync.

**Production:** https://deepwork-three.vercel.app  
**Repository:** https://github.com/postmanxdxd-hash/deepwork

---

## Table of Contents

1. [Overview](#overview)
2. [Tech Stack](#tech-stack)
3. [System Architecture](#system-architecture)
4. [Data Model](#data-model)
5. [Scoring Engine](#scoring-engine)
6. [Today View](#today-view)
7. [Week & History Views](#week--history-views)
8. [Features](#features)
9. [Screens & Routes](#screens--routes)
10. [Key Components](#key-components)
11. [Authentication & Security](#authentication--security)
12. [Notifications](#notifications)
13. [Project Structure](#project-structure)
14. [Environment Variables](#environment-variables)
15. [Deployment](#deployment)
16. [Migrations](#migrations)

---

## Overview

**Purpose:** Track daily and weekly habits using a customizable points rubric. Score each day and week, build streaks, capture MIT/highlight reflections, and collect personal notes over time.

**Platforms:** Responsive mobile web + desktop web (PWA-installable on phone).

**Users:** Single-user accounts with required login; data synced via Supabase.

**Default template:** June 2026 rubric (Easy / Medium / Hard / Hard+ / Fajr tiers) or blank start.

**Design principles (Phase 2):**
- Reduce daily friction — no blocking modals, inline MIT, Fajr one-tap shortcut
- Softer blank penalties to avoid loss-aversion avoidance
- Gym and weekly habits live on the Week view only
- Habit days start at **4:00 AM Asia/Beirut** for penalty timing
- Notes never affect scoring

---

## Tech Stack

| Layer | Technology | Notes |
|-------|------------|-------|
| Framework | Next.js 15 (App Router) + React 19 + TypeScript | Strict mode |
| Styling | Tailwind CSS 4 + CSS variables | Light / dark / system |
| Auth & DB | Supabase (Auth + PostgreSQL + RLS) | Required login |
| Hosting | Vercel | Node 20, `xxhash64` webpack hash |
| Notifications | In-app browser notifications only | No push cron |
| State | `AppProvider` React context | Client-side scoring |

**Removed (intentionally):** PDF export, push notification cron, external Web Push infrastructure, blocking MIT/Highlight modals.

---

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Browser (PWA)                           │
│  ┌─────────────┐  ┌──────────────┐  ┌─────────────────────┐ │
│  │ Today       │  │ MitInlineField│  │ ReminderChecker     │ │
│  │ Week        │  │ FajrShortcut  │  └─────────────────────┘ │
│  │ History     │  │ DeepWorkRow   │                          │
│  │ Notes       │  │ RubricEditor  │                          │
│  └──────┬──────┘  └──────┬───────┘                          │
│         │                │                                   │
│         └────────┬───────┘                                   │
│                  ▼                                           │
│         AppProvider (React Context)                          │
│         profile · rubric · logs · notes · scoringContext     │
└──────────────────┬──────────────────────────────────────────┘
                   │
                   ▼
┌──────────────────────────────────────────────────────────────┐
│                      Supabase                                │
│   Auth │ profiles │ rubrics │ tiers │ habits │ daily_logs   │
│        │ journal_notes                                      │
└──────────────────────────────────────────────────────────────┘
```

**Request flow:**
1. User opens app → middleware refreshes Supabase session
2. App layout loads profile + rubric + logs into `AppProvider`
3. Today view renders Fajr shortcut, MIT inline field, tier-grouped habits
4. User logs habits → `upsertLog` writes to `daily_logs`
5. Scoring recalculates client-side from logs + rubric + timezone-aware day boundaries

**No server API routes** — all habit logic runs client-side against Supabase.

---

## Data Model

### `profiles`
| Column | Purpose |
|--------|---------|
| `theme` | `light` / `dark` / `system` |
| `timezone` | Default `Asia/Beirut` |
| `mvd_threshold` | Minimum viable day score (default **10**) |
| `reminder_morning_enabled` | In-app morning reminder toggle |
| `reminder_morning_time` | Default 07:30 |
| `reminder_evening_enabled` | In-app evening reminder toggle |
| `reminder_evening_time` | Default 21:00 |

### `rubrics` → `tiers` → `habits`
- **Tiers:** label, done/attempted/blank points, colors, sort order
- **Habits:** name, icon, type, cadence, `role`, `special_config`

### Habit types

| Type | Logging | Scoring |
|------|---------|---------|
| `standard` | Tap to cycle done → attempted → blank → unset | Tier points |
| `text` | Write content = done | done_pts if filled, blank_pts if empty |
| `deepwork` | −/+ block counter (25-min blocks, unlimited) | See [Deep Work](#deep-work) |
| `gym` | Session count 0–5 | Week view only |

### Habit roles (`habits.role`)

| Role | Purpose |
|------|---------|
| `mit` | Most Important Task — inline field at top of Today (hidden from tier list) |
| `highlight` | Highlight of the Day — text habit in Easy tier |
| `null` | Normal habit |

Identified by dedicated `role` column only (`src/lib/habits/identify.ts`). No name-string fallback.

### Special habit behaviors

| Habit | Behavior |
|-------|----------|
| **Fajr** | Binary: done ↔ unset only (no attempted). Identified by FAJR tier label. |
| **Deep Work** | 0 or N blocks only (no attempted state). |
| **Gym** | Logged on Week view; excluded from Today. |
| **Weekly Review** | Logged on Week view; excluded from Today. |

### `daily_logs`
One row per user + habit + date: `status`, `content`, `deepwork_blocks`, `gym_sessions`.

### `journal_notes`
Free-form notes with `note_date`. **Does not affect scoring.**

---

## Scoring Engine

**Location:** `src/lib/scoring/index.ts`  
**Constants:** `src/lib/types.ts`  
**Day boundaries:** `src/lib/reminders/timezone.ts`

### Per-tier points (June 2026 template)

| Tier | Done | Attempted | Blank |
|------|------|-----------|-------|
| Easy | +1 | 0 | 0 |
| Medium | +2 | 0 | −1 |
| Hard | +3 | +1 | −1 |
| Hard+ | +4 | +1 | −2 |
| Fajr | +4 | 0 | −3 |

Fajr ignores attempted — only done or not done.

### Deep Work

25-minute blocks. Unlimited count.

| Blocks | Points |
|--------|--------|
| 0 | 0 |
| 1 | +2 |
| 2 | +5 |
| 3 | +9 |
| 4 | +18 |
| 5 | +27 |
| N ≥ 3 | 9 + (N − 3) × 9 |

Implemented in `pointsForDeepWorkBlocks()` (`src/lib/types.ts`).

### Gym (Week view only)

Weekly session count → points:

| Sessions | Points |
|----------|--------|
| 0–2 | −5 each |
| 3 | +5 |
| 4 | +10 |
| 5 | +15 |

Excluded from Today/History week totals. Shown as separate line on Week and History.

### Weekly Review

Scored once per week (Hard+ tier). Blank penalty deferred until Saturday 4:00 AM.

### Day boundary — when blank penalties apply

Habit days start at **4:00 AM** in the user's timezone (`shouldApplyBlankPenalties()`).

| Situation | Blank penalty for unset habits? |
|-----------|--------------------------------|
| Future calendar days | No — score 0 |
| Today before 4:00 AM | No — score 0 |
| Today after 4:00 AM | Yes |
| Past calendar days | Yes |

Positive points (done habits) always count immediately. Only automatic minuses for unset/empty habits are deferred.

### Week score

- Sum of daily scores (with day-boundary rules) + weekly review
- Gym **excluded** from Today/History week card total
- Negative raw total **floors to 0** (`calcWeekScore`)

### Week quality labels

| Label | Score range |
|-------|-------------|
| Excellent | +60 to +80 |
| Solid | +30 to +50 |
| Rough | 0 to +20 |
| Bad week | Negative → reset to 0 |

### Streaks

- **Per-habit:** consecutive days marked done
- **Weekly quality:** consecutive Solid/Excellent weeks
- **Never miss twice:** amber banner on Today when yesterday's score ≤ 0

---

## Today View

**Route:** `/today`  
**Layout order (top to bottom):**

1. Header — week strip, score cards, streaks, progress bar
2. **Fajr shortcut** — one-tap "Mark Fajr done" when unlogged today
3. **MIT inline field** — persistent text input (never blocking)
4. Tier sections in order: **Fajr → Deep Work → Medium → Easy**

**Excluded from main tier list:**
- Gym and Weekly Review (logged in **Weekly** section at bottom of Today)
- MIT habit row (shown via inline field instead)

**Weekly section (bottom of Today):**
- Gym session counter (0–5)
- Weekly Review textarea

**Score cards:**
- **TODAY** — current day score + done count
- **THIS WEEK** — week total without gym
- **MVD indicator** — "Good enough for today" when score ≥ `mvd_threshold` (default +10)

**Tier sort logic:** `src/lib/habits/todayDisplay.ts`

---

## Week & History Views

### Week (`/week`)
- Full 7-day grid (all habits including Gym and Weekly Review)
- Week score (daily habits only) + separate Gym line
- Tap cell → navigate to `/today?date=…&habit=…`

### History (`/history`)
- Last **4 weeks** selector
- Week score, gym line, avg completion, daily breakdown
- "View this week in Today" button

---

## Features

### Core habit tracking
- Daily view with week strip, score cards, MVD, Fajr shortcut, MIT inline
- Weekly grid with gym scoring
- 4-week history
- Full rubric editor via Settings → `/habits`
- Per-habit rename from Today (✏️ button)

### Journal notes (`/notes`)
- Free-form notes grouped by date
- Synced to `journal_notes` table
- **Never affects scoring**

### Settings (`/settings`)
- MVD threshold input
- Theme (light / dark / system)
- In-app reminder toggles (7:30 AM / 9:00 PM Lebanon time)
- Link to habit editor
- Sign out

### Theming
Light / dark / system via `ThemeProvider` + CSS variables.

---

## Screens & Routes

| Route | Purpose |
|-------|---------|
| `/login` | Sign in |
| `/signup` | Create account |
| `/forgot-password` | Password reset |
| `/onboarding` | Choose June 2026 or blank template |
| `/today` | Main dashboard + daily logging |
| `/week` | Weekly grid (Gym, Weekly Review) |
| `/history` | Past 4 weeks stats |
| `/notes` | Journal notes collection |
| `/habits` | Full rubric editor (Settings link) |
| `/settings` | MVD, theme, reminders, account |

**Navigation tabs:** Today · Week · History · Notes · Settings

---

## Key Components

| Component | Location | Role |
|-----------|----------|------|
| `AppProvider` | `providers/AppProvider.tsx` | Global state, scoring context with timezone |
| `MitInlineField` | `habits/MitInlineField.tsx` | Persistent MIT input on Today |
| `FajrShortcut` | `habits/FajrShortcut.tsx` | One-tap Fajr done button |
| `DeepWorkRow` | `habits/DeepWorkRow.tsx` | −/+ block counter for Deep Work |
| `HabitRow` | `habits/HabitRow.tsx` | Standard habit tap-to-cycle |
| `TierSection` | `habits/TierSection.tsx` | Tier header + habit rows |
| `WeekStrip` | `layout/WeekStrip.tsx` | Sun–Sat picker with day scores |
| `ScoreCards` | `layout/ScoreCards.tsx` | Today + week score cards, MVD |
| `StreakBadge` | `layout/StreakBadge.tsx` | Habit streak + never-miss-twice |
| `WeeklyGrid` | `grid/WeeklyGrid.tsx` | Week overview table |
| `RubricEditor` | `settings/RubricEditor.tsx` | Full tier/habit CRUD |
| `ReminderChecker` | `reminders/ReminderChecker.tsx` | In-browser notification scheduler |

### Key libraries

| Module | Purpose |
|--------|---------|
| `lib/scoring/index.ts` | All score, streak, week quality calculations |
| `lib/habits/identify.ts` | MIT, highlight, Fajr role resolution |
| `lib/habits/todayDisplay.ts` | Today tier filtering and sort order |
| `lib/rubric/templates.ts` | June 2026 + blank default rubrics |
| `lib/rubric/actions.ts` | Supabase seed, fetch, upsert |
| `lib/reminders/timezone.ts` | Lebanon timezone + 4 AM day boundary |
| `lib/notes/actions.ts` | Journal CRUD |

---

## Authentication & Security

- **Supabase Auth** — email/password, required before app access
- **Middleware** (`src/middleware.ts`) — session refresh, redirect unauthenticated users to `/login`
- **RLS** — every table scoped to `auth.uid()`
- **Onboarding gate** — redirect to `/onboarding` if no rubric exists

---

## Notifications

| Trigger | Time | Mechanism |
|---------|------|-----------|
| Morning | 7:30 AM Asia/Beirut | In-app (`ReminderChecker`) |
| Evening | 9:00 PM Asia/Beirut | In-app (`ReminderChecker`) |

Reminders fire only while the app is open in the browser. No push when app is closed.

---

## Project Structure

```
src/
├── app/
│   ├── (auth)/              login, signup, forgot-password
│   ├── (app)/               today, week, history, notes, settings, habits
│   ├── onboarding/          template picker
│   └── layout.tsx           root layout
├── components/
│   ├── habits/              HabitRow, DeepWorkRow, MitInlineField, FajrShortcut, TierSection
│   ├── settings/            RubricEditor, HabitEditorRow
│   ├── layout/              AppNav, WeekStrip, ScoreCards, StreakBadge
│   ├── grid/                WeeklyGrid
│   ├── providers/           AppProvider, ThemeProvider
│   └── reminders/           ReminderChecker
├── lib/
│   ├── scoring/             Points, streaks, week quality, day-boundary-aware calc
│   ├── rubric/              Templates, seed, editor actions
│   ├── habits/              Role identification, today display order
│   ├── notes/               Journal CRUD
│   ├── reminders/           Timezone + 4 AM day boundary
│   └── supabase/            Client, server, middleware
supabase/
├── schema.sql               Base schema (run first)
└── migrations/
    ├── 002_reminders_and_push.sql
    ├── 003_journal_notes.sql
    └── 004_role_enum_and_mvd_threshold.sql
public/
├── sw.js                    Service worker (legacy, in-app reminders only)
└── manifest.json            PWA manifest
```

---

## Environment Variables

| Variable | Required | Purpose |
|----------|----------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Yes | Client-side Supabase key |

No VAPID, cron, or service-role keys required.

---

## Deployment

| Item | Value |
|------|-------|
| GitHub | [github.com/postmanxdxd-hash/deepwork](https://github.com/postmanxdxd-hash/deepwork) |
| Production | https://deepwork-three.vercel.app |
| Node version | 20.x (`.nvmrc`, `vercel.json`, `package.json` engines) |
| Build fix | `webpack.output.hashFunction = "xxhash64"` in `next.config.ts` |
| Deploy | `git push` (auto) or `npx vercel --prod --force` |

See [DEPLOY.md](./DEPLOY.md) for step-by-step setup.

**Supabase auth:** Set Site URL and redirect URLs to `https://deepwork-three.vercel.app/**`

---

## Migrations

Run in Supabase SQL Editor in order:

| # | File | Purpose |
|---|------|---------|
| 1 | `supabase/schema.sql` | Base schema + RLS |
| 2 | `supabase/migrations/002_reminders_and_push.sql` | Profile reminder columns |
| 3 | `supabase/migrations/003_journal_notes.sql` | Journal notes table |
| 4 | `supabase/migrations/004_role_enum_and_mvd_threshold.sql` | `habits.role`, `profiles.mvd_threshold`, penalty backfill |

Do not edit `schema.sql` directly for changes — add numbered migration files.
