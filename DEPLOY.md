# Deploy Habit Tracker to Vercel

Follow these steps in order. Total time: ~15 minutes.

---

## Step 1 — Finish Supabase setup

### A. Run migrations (if not done)

In [Supabase SQL Editor](https://supabase.com/dashboard/project/aojswyqrnjvcolpbqfsb/sql):

1. Run `supabase/schema.sql` (skip if already done)
2. Run `supabase/migrations/002_reminders_and_push.sql`
3. Run `supabase/migrations/003_journal_notes.sql`
4. Run `supabase/migrations/004_role_enum_and_mvd_threshold.sql`

### B. Get your service role key (optional)

Only needed if you add server-side admin features later. Not required for core app.

---

## Step 2 — Push code to GitHub

```bash
cd /Users/moe/Desktop/App

git init
git add .
git commit -m "Initial habit tracker app"

gh repo create habit-tracker --private --source=. --push
```

---

## Step 3 — Deploy on Vercel

1. Go to [vercel.com/new](https://vercel.com/new)
2. **Import** your GitHub repo
3. Framework: **Next.js** (auto-detected)
4. Add these **Environment Variables**:

| Name | Value |
|------|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://aojswyqrnjvcolpbqfsb.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | *(your publishable key)* |

5. Click **Deploy**
6. Copy your live URL (e.g. `https://deepwork-three.vercel.app`)

---

## Step 4 — Configure Supabase auth for production

In Supabase → **Authentication** → **URL Configuration**:

| Field | Value |
|-------|-------|
| **Site URL** | `https://YOUR-VERCEL-URL.vercel.app` |
| **Redirect URLs** | `https://YOUR-VERCEL-URL.vercel.app/**` |

Click **Save**.

---

## Step 5 — Enable in-app reminders

1. Open your **live Vercel URL** on your phone or laptop
2. Sign up / log in
3. **Settings** → enable morning (7:30 AM) + evening (9:00 PM) → **Save reminders**
4. Allow notifications when prompted (reminders fire while the app is open)

---

## CLI deploy (alternative)

```bash
npx vercel login
npx vercel link
npx vercel env add NEXT_PUBLIC_SUPABASE_URL
npx vercel env add NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
npx vercel --prod
```

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| Can't sign up on live site | Add Vercel URL to Supabase redirect URLs |
| Reminders don't appear | Keep the app open in browser; check notification permission |
| MIT/highlight not identified | Run migration `004_role_enum_and_mvd_threshold.sql` |
