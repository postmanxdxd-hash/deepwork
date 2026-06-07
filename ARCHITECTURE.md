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
| Push | Web Push API + `web-push` | Phone notifications (with external cron on Hobby plan) |
| Local cache | IndexedDB-ready architecture via client state | Fast logging UX |

---

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Browser (PWA)                           │
│  ┌─────────────┐  ┌──────────────┐  ┌─────────────────────┐ │
│  │ Today/Week  │  │ DailyPrompts │  │ Service Worker      │ │
│  │ History     │  │ RubricEditor │  │ (push + click)      │ │
│  │ Notes       │  │ ReminderChk  │  └─────────────────────┘ │
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
│        │ journal_notes │ push_subscriptions                  │
└──────────────────────────────────────────────────────────────┘
                   │
                   ▼
┌──────────────────────────────────────────────────────────────┐
│              Next.js API Routes (Vercel)                     │
│   /api/push/subscribe │ /api/cron/reminders │ /api/export/pdf│
└──────────────────────────────────────────────────────────────┘
```

**Request flow:**
1. User opens app → middleware refreshes Supabase session
2. App layout loads profile + rubric + logs into `AppProvider`
3. `DailyPrompts` checks MIT/highlight state → shows modals if needed
4. User logs habits → `upsertLog` writes to `daily_logs`
5. Scoring recalculates client-side from logs + rubric

---

## Data Model

### `profiles`
User settings: theme, timezone (`Asia/Beirut`), morning/evening reminder toggles.

### `rubrics` → `tiers` → `habits`
Customizable scoring structure:
- **Tiers:** label, done/attempted/blank points, colors, sort order
- **Habits:** name, icon, type, cadence, `special_config`

### Habit types

| Type | Behavior |
|------|----------|
| `standard` | Tap to cycle: blank → done → attempted → blank |
| `text` | Write content = done; empty = blank penalty |
| `deepwork` | 0–3 blocks of 30 min → 0/2/5/9 pts |
| `gym` | Weekly session count → 0–5 scale |

### Habit roles (`special_config.role`)

| Role | Purpose |
|------|---------|
| `mit` | Single Most Important Task — morning popup |
| `highlight` | Highlight of the Day — evening popup |

Identified by role or name fallback (`lib/habits/identify.ts`).

### `daily_logs`
One row per user + habit + date: status, content, deepwork_blocks, gym_sessions.

### `journal_notes`
Free-form notes/quotes with `note_date` — browsable collection by day.

### `push_subscriptions` + `reminder_sent_log`
Web push endpoints and deduplication for morning/evening reminders.

---

## Scoring Engine

**Location:** `src/lib/scoring/index.ts`

### Per-tier points (June 2026 template)

| Tier | Done | Attempted | Blank |
|------|------|-----------|-------|
| Easy | +1 | 0 | −1 |
| Medium | +2 | 0 | −2 |
| Hard | +3 | +1 | −3 |
| Hard+ | +4 | +1 | −4 |
| Fajr | +4 | +1 | −4 |

### Special scoring
- **Deep Work:** cumulative blocks `[0, 2, 5, 9]`
- **Gym:** weekly `{0–2: −5, 3: +5, 4: +10, 5: +15}`
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
- Daily view with week strip, score cards, progress bar, streak badges
- Weekly grid (habits × 7 days)
- 8-week history with completion stats
- Full rubric editor (rename/add/delete tiers & habits)

### Daily prompts
- **MIT popup:** On every app open until filled; snooze hides for current session only; re-prompts on next visit
- **Highlight popup:** After 5 PM Lebanon time; skippable for the day

### Journal notes
- **Notes tab:** Write quotes, reminders, ideas
- Grouped by date in reverse chronological collection
- Synced to Supabase per user

### Notifications
- Morning 7:30 AM + evening 9:00 PM (Asia/Beirut)
- In-app when browser open; Web Push when subscribed + deployed

### Export
- Weekly report download (text summary via `/api/export/pdf`)

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
| `/history` | Past 8 weeks stats |
| `/notes` | Journal notes collection |
| `/settings` | Rubric editor, theme, notifications, export, account |

---

## Key Components

| Component | Role |
|-----------|------|
| `AppProvider` | Global state: rubric, logs, notes, scoring context |
| `DailyPrompts` | MIT + highlight modals |
| `PromptModal` | Reusable popup UI |
| `RubricEditor` | Full tier/habit CRUD |
| `HabitEditorRow` | Controlled habit name/icon (fixes rename bug) |
| `TierSection` | Renders habits by tier on Today view |
| `WeekStrip` | Sun–Sat day picker with scores |
| `WeeklyGrid` | Spreadsheet-style week view |
| `ReminderChecker` | In-browser notification scheduler |

---

## API Routes

| Route | Method | Purpose |
|-------|--------|---------|
| `/api/push/subscribe` | POST/DELETE | Save/remove Web Push subscription |
| `/api/cron/reminders` | GET | Send scheduled push (Bearer `CRON_SECRET`) |
| `/api/export/pdf` | GET | Download weekly text report |

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
| Morning | 7:30 AM Asia/Beirut | Push + in-app |
| Evening | 9:00 PM Asia/Beirut | Push + in-app |
| MIT popup | Every app open until filled | `DailyPrompts` + sessionStorage snooze |
| Highlight popup | After 5 PM, skippable | `DailyPrompts` + localStorage skip |

**Vercel Hobby:** No minute-level cron. Use [cron-job.org](https://cron-job.org) to hit `/api/cron/reminders` or rely on in-app reminders.

---

## Project Structure

```
src/
├── app/
│   ├── (auth)/          login, signup, forgot-password
│   ├── (app)/           today, week, history, notes, settings
│   ├── onboarding/
│   └── api/             push, cron, export
├── components/
│   ├── habits/          HabitRow, TextHabitRow, DeepWorkRow, GymRow, TierSection
│   ├── prompts/         DailyPrompts, PromptModal
│   ├── settings/        RubricEditor, HabitEditorRow
│   ├── layout/          AppNav, WeekStrip, ScoreCards, StreakBadge
│   ├── grid/            WeeklyGrid
│   ├── providers/       AppProvider, ThemeProvider
│   └── reminders/       ReminderChecker
├── lib/
│   ├── scoring/         Points, streaks, week quality
│   ├── rubric/          Templates, seed, editor actions
│   ├── habits/          MIT/highlight identification
│   ├── notes/           Journal CRUD
│   ├── reminders/       Timezone helpers
│   ├── push/            Web Push client + server
│   └── supabase/        Client, server, middleware
supabase/
├── schema.sql
└── migrations/
```

---

## Environment Variables

| Variable | Required | Purpose |
|----------|----------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Yes | Client-side Supabase key |
| `SUPABASE_SERVICE_ROLE_KEY` | For push cron | Admin DB access |
| `NEXT_PUBLIC_VAPID_PUBLIC_KEY` | For push | Web Push public key |
| `VAPID_PRIVATE_KEY` | For push | Web Push private key |
| `VAPID_SUBJECT` | For push | mailto: contact |
| `CRON_SECRET` | For push cron | Protects cron endpoint |

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
2. `supabase/migrations/002_reminders_and_push.sql` — push + reminder columns
3. `supabase/migrations/003_journal_notes.sql` — notes collection
