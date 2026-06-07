# Deep Work — Habit Tracker Architecture

Personalized habit tracking web app with points-based scoring, daily prompts, journal notes, streaks, and cloud sync. Deployed at **https://deepwork-three.vercel.app**.

---

## Table of Contents

1. [Overview](#overview)
2. [Tech Stack](#tech-stack)
3. [System Architecture](#system-architecture)
4. [Data Model](#data-model)
5. [Scoring Engine](#scoring-engine)
6. [Features](#features)
7. [Screens & Routes](#screens--routes)
8. [Key Components](#key-components)
9. [API Routes](#api-routes)
10. [Authentication & Security](#authentication--security)
11. [Notifications](#notifications)
12. [Project Structure](#project-structure)
13. [Environment Variables](#environment-variables)
14. [Deployment](#deployment)

---

## Overview

**Purpose:** Track daily and weekly habits using a customizable points rubric. Score each day and week, build streaks, capture MIT/highlight reflections, and collect personal notes over time.

**Platforms:** Responsive mobile web + desktop web (PWA-installable on phone).

**Users:** Single-user accounts with required login; data synced via Supabase.

**Default template:** June 2026 rubric (Easy / Medium / Hard / Hard+ / Fajr tiers) or blank start.

---

## Tech Stack

| Layer | Technology | Why |
|-------|------------|-----|
| Framework | Next.js 15 (App Router) + React 19 + TypeScript | SSR, API routes, one codebase for mobile + desktop |
| Styling | Tailwind CSS 4 + CSS variables | Responsive, light/dark theming |
| Auth & DB | Supabase (Auth + PostgreSQL) | Login, cloud sync, Row Level Security |
| Hosting | Vercel | Production deploy, serverless functions |
| Push | In-app browser notifications only | Reminders while app is open |
| Local cache | IndexedDB-ready architecture via client state | Fast logging UX |

---

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Browser (PWA)                           │
│  ┌─────────────┐  ┌──────────────┐  ┌─────────────────────┐ │
│  │ Today/Week  │  │ MitInlineField│  │ ReminderChecker     │ │
│  │ History     │  │ FajrShortcut  │  └─────────────────────┘ │
│  │ Notes       │  │ RubricEditor  │                          │
│  └──────┬──────┘  └──────┬───────┘                          │
│         │                │                                   │
│         └────────┬───────┘                                   │
│                  ▼                                           │
│         AppProvider (React Context)                          │
│         scoring · logs · habits · notes                      │
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
3. Today view shows MIT inline field, Fajr shortcut, score cards with MVD indicator
4. User logs habits → `upsertLog` writes to `daily_logs`
5. Scoring recalculates client-side from logs + rubric

---

## Data Model

### `profiles`
User settings: theme, timezone (`Asia/Beirut`), morning/evening reminder toggles, `mvd_threshold` (default 10).

### `rubrics` → `tiers` → `habits`
Customizable scoring structure:
- **Tiers:** label, done/attempted/blank points, colors, sort order
- **Habits:** name, icon, type, cadence, `role` (`mit` | `highlight` | null), `special_config`

### Habit types

| Type | Behavior |
|------|----------|
| `standard` | Tap to cycle: blank → done → attempted → blank |
| `text` | Write content = done; empty = blank penalty |
| `deepwork` | 25-min blocks, no logging cap → 0/2/5/9 pts (3+ blocks = +9) |
| `gym` | Weekly session count → 0–5 scale |

### Habit roles (`habits.role`)

| Role | Purpose |
|------|---------|
| `mit` | Single Most Important Task — inline field at top of Today |
| `highlight` | Highlight of the Day — text habit in rubric |

Identified by dedicated `role` column only (`lib/habits/identify.ts`).

### `daily_logs`
One row per user + habit + date: status, content, deepwork_blocks, gym_sessions.

### `journal_notes`
Free-form notes/quotes with `note_date` — browsable collection by day.

---

## Scoring Engine

**Location:** `src/lib/scoring/index.ts`

### Per-tier points (June 2026 template)

| Tier | Done | Attempted | Blank |
|------|------|-----------|-------|
| Easy | +1 | 0 | 0 |
| Medium | +2 | 0 | −1 |
| Hard | +3 | +1 | −1 |
| Hard+ | +4 | +1 | −2 |
| Fajr | +4 | +1 | −3 |

### Special scoring
- **Deep Work:** 25-min blocks → 1=+2, 2=+5, 3=+9, each extra block +9
- **Gym:** weekly `{0–2: −5, 3: +5, 4: +10, 5: +15}` — shown on Week/History only, excluded from Today week total
- **Text habits:** non-empty = done points; empty = blank penalty
- **Weekly Review:** scored once per week (Hard+ tier)

### Week quality labels

| Label | Score range |
|-------|-------------|
| Excellent | +60 to +80 |
| Solid | +30 to +50 |
| Rough | 0 to +20 |
| Bad week | Negative → **reset to 0** |

### Streaks
- **Per-habit:** consecutive days marked done
- **Weekly quality:** consecutive Solid/Excellent weeks

---

## Features

### Core habit tracking
- Daily view with week strip, score cards, MVD indicator, Fajr shortcut, MIT inline field
- Weekly grid (habits × 7 days) with gym score shown separately
- 4-week history with completion stats
- Full rubric editor via Settings → `/habits`

### Today UX
- **MIT inline field:** Persistent at top of Today, never blocking
- **Fajr shortcut:** One-tap "Mark Fajr done" when unlogged
- **Never miss twice:** Amber banner when yesterday's score ≤ 0
- **Minimum viable day:** Configurable threshold (default +10) shows "Good enough for today"

### Journal notes
- **Notes tab:** Write quotes, reminders, ideas
- Grouped by date in reverse chronological collection
- Synced to Supabase per user

### Notifications
- Morning 7:30 AM + evening 9:00 PM (Asia/Beirut)
- In-app only when browser is open (`ReminderChecker`)

### Theming
- Light / dark / system preference

---

## Screens & Routes

| Route | Purpose |
|-------|---------|
| `/login` | Sign in |
| `/signup` | Create account |
| `/forgot-password` | Password reset |
| `/onboarding` | Choose June 2026 or blank template |
| `/today` | Main dashboard + habit logging |
| `/week` | Weekly grid overview |
| `/history` | Past 4 weeks stats |
| `/notes` | Journal notes collection |
| `/habits` | Full rubric editor (linked from Settings) |
| `/settings` | MVD threshold, theme, in-app reminders, account |

---

## Key Components

| Component | Role |
|-----------|------|
| `AppProvider` | Global state: rubric, logs, notes, scoring context |
| `MitInlineField` | Persistent MIT text input on Today |
| `FajrShortcut` | One-tap Fajr done button |
| `RubricEditor` | Full tier/habit CRUD |
| `HabitEditorRow` | Controlled habit name/icon (fixes rename bug) |
| `TierSection` | Renders habits by tier on Today view |
| `WeekStrip` | Sun–Sat day picker with scores |
| `WeeklyGrid` | Spreadsheet-style week view |
| `ReminderChecker` | In-browser notification scheduler |

---

## Authentication & Security

- **Supabase Auth** — email/password, required before app access
- **Middleware** (`src/middleware.ts`) — session refresh, redirect unauthenticated users to `/login`
- **RLS** — every table scoped to `auth.uid()`
- **Secrets** — service role key server-only; never in client bundle

---

## Notifications

| Trigger | Time | Mechanism |
|---------|------|-----------|
| Morning | 7:30 AM Asia/Beirut | In-app (`ReminderChecker`) |
| Evening | 9:00 PM Asia/Beirut | In-app (`ReminderChecker`) |

---

## Project Structure

```
src/
├── app/
│   ├── (auth)/          login, signup, forgot-password
│   ├── (app)/           today, week, history, notes, settings, habits
│   ├── onboarding/
├── components/
│   ├── habits/          HabitRow, MitInlineField, FajrShortcut, TierSection
│   ├── settings/        RubricEditor, HabitEditorRow
│   ├── layout/          AppNav, WeekStrip, ScoreCards, StreakBadge
│   ├── grid/            WeeklyGrid
│   ├── providers/       AppProvider, ThemeProvider
│   └── reminders/       ReminderChecker
├── lib/
│   ├── scoring/         Points, streaks, week quality
│   ├── rubric/          Templates, seed, editor actions
│   ├── habits/          Role identification, Fajr finder
│   ├── notes/           Journal CRUD
│   ├── reminders/       Timezone helpers
│   └── supabase/        Client, server, middleware
supabase/
├── schema.sql
└── migrations/
    ├── 002_reminders_and_push.sql
    ├── 003_journal_notes.sql
    └── 004_role_enum_and_mvd_threshold.sql
```

---

## Environment Variables

| Variable | Required | Purpose |
|----------|----------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Yes | Client-side Supabase key |

---

## Deployment

- **GitHub:** [github.com/postmanxdxd-hash/deepwork](https://github.com/postmanxdxd-hash/deepwork)
- **Production:** https://deepwork-three.vercel.app
- **Deploy command:** `npx vercel --prod`
- **Supabase:** Run `schema.sql` + migrations in SQL Editor; set Site URL to Vercel domain

See [DEPLOY.md](./DEPLOY.md) for step-by-step setup.

---

## Migrations (run in order)

1. `supabase/schema.sql` — base schema
2. `supabase/migrations/002_reminders_and_push.sql` — reminder columns
3. `supabase/migrations/003_journal_notes.sql` — notes collection
4. `supabase/migrations/004_role_enum_and_mvd_threshold.sql` — habit roles, MVD threshold, penalty backfill
