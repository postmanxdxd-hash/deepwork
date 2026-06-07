# Habit Tracker

A personalized habit tracking web app with customizable rubrics, points-based scoring, streaks, daily/weekly views, cloud sync, and PDF export.

Works on **mobile web** and **laptop web** — one responsive app, synced via Supabase.

## Features

- **June 2026 rubric template** (or start blank) with Easy, Medium, Hard, Hard+, and Fajr tiers
- **Standard habits** — tap to cycle Done / Attempted / Blank
- **Text habits** — Highlight of the Day, Single Most Important Task, Weekly Review (writing = Done)
- **Deep Work** — 30-min block scoring (0 → 2 → 5 → 9 pts)
- **Gym** — weekly session scoring
- **Streaks** — per-habit and weekly-quality (Solid/Excellent)
- **Views** — Today dashboard, weekly grid, 8-week history
- **Auth & sync** — Supabase login, data synced across devices
- **Export** — weekly report download
- **Rubric editor** — rename, add, delete tiers and habits; change points and types
- **Notifications** — 7:30 AM & 9:00 PM Lebanon time (Asia/Beirut)
- **Theme** — light, dark, or system

## Prerequisites

- Node.js 18+
- A [Supabase](https://supabase.com) project (free tier works)

## Setup

### 1. Clone and install

```bash
cd App
npm install
```

### 2. Configure Supabase

1. Create a project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor** and run [`supabase/schema.sql`](supabase/schema.sql)
3. If you already ran an older schema, also run [`supabase/migrations/002_reminders_and_push.sql`](supabase/migrations/002_reminders_and_push.sql)
4. Go to **Project Settings → API** and copy your URL and publishable key

### 3. Environment variables

```bash
cp .env.example .env.local
```

Edit `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-publishable-key
```

### 4. Phone notifications (optional)

**Yes, this works on your phone** — as a web app added to your home screen.

1. In the app: **Settings → Phone notifications** → enable morning (7:30 AM) and evening (9:00 PM) → **Save**
2. Allow notifications when prompted
3. On iPhone: Safari → Share → **Add to Home Screen**
4. On Android: Chrome → menu → **Install app** / Add to Home Screen

**When the browser is open:** reminders fire automatically (Lebanon time).

**When the app is closed:** deploy to Vercel and add push keys:

```bash
npx web-push generate-vapid-keys
```

Add to `.env.local` / Vercel env:

```
NEXT_PUBLIC_VAPID_PUBLIC_KEY=...
VAPID_PRIVATE_KEY=...
VAPID_SUBJECT=mailto:you@example.com
CRON_SECRET=some-random-secret
SUPABASE_SERVICE_ROLE_KEY=...  # Supabase → Settings → API → service_role
```

Vercel runs `/api/cron/reminders` every minute to send push at 7:30 AM and 9:00 PM Asia/Beirut.

### 5. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### 6. First use

1. **Sign up** with email and password
2. Choose **June 2026** template or **Start blank**
3. Log habits on the **Today** tab

## Deploy

### Vercel

1. Push to GitHub
2. Import project in [Vercel](https://vercel.com)
3. Add the same environment variables
4. Deploy

### Supabase auth redirect

In Supabase **Authentication → URL Configuration**, add your production URL (e.g. `https://your-app.vercel.app`) to **Site URL** and **Redirect URLs**.

## Project structure

```
src/
  app/
    (auth)/          Login, signup, forgot password
    (app)/           Today, week, history, settings
    onboarding/      Template picker
    api/export/pdf/  Weekly report export
  components/
    habits/          Habit rows, tier sections
    layout/          Nav, week strip, score cards
    grid/            Weekly grid
    providers/       App context, theme
  lib/
    scoring/         Points, streaks, week quality
    rubric/          Templates, Supabase actions
    supabase/        Client, server, middleware
supabase/
  schema.sql         Database schema + RLS
```

## Scoring reference (June 2026 template)

| Tier   | Done | Attempted | Blank |
|--------|------|-----------|-------|
| Easy   | +1   | 0         | −1    |
| Medium | +2   | 0         | −2    |
| Hard   | +3   | +1        | −3    |
| Hard+  | +4   | +1        | −4    |
| Fajr   | +4   | +1        | −4    |

**Weekly benchmarks:** Excellent (+60–80), Solid (+30–50), Rough (0–20), Bad (negative → reset to 0)

## License

Private — personal use.
