# Deploy Habit Tracker to Vercel

Follow these steps in order. Total time: ~15 minutes.

---

## Step 1 — Finish Supabase setup

### A. Run migrations (if not done)

In [Supabase SQL Editor](https://supabase.com/dashboard/project/aojswyqrnjvcolpbqfsb/sql):

1. Run `supabase/schema.sql` (skip if already done)
2. Run `supabase/migrations/002_reminders_and_push.sql`

### B. Get your service role key

1. Supabase → **Project Settings** → **API**
2. Copy **service_role** key (secret — never expose in frontend code)

---

## Step 2 — Push code to GitHub

```bash
cd /Users/moe/Desktop/App

# Initialize git (first time only)
git init
git add .
git commit -m "Initial habit tracker app"

# Create repo on GitHub (requires gh CLI logged in)
gh repo create habit-tracker --private --source=. --push

# OR: create repo manually on github.com, then:
# git remote add origin https://github.com/YOUR_USERNAME/habit-tracker.git
# git branch -M main
# git push -u origin main
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
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | `sb_publishable_t6DWmFZd0cuvnwo4qv21dQ_1_sj_pCA` |
| `NEXT_PUBLIC_VAPID_PUBLIC_KEY` | `BE5SriT_RKgGA8NO6P8nExgXeDJcu24mMAy4W3KgOuCwqS9QE8JORVKt5dKsDyR1CaY4UfYU-YchG3XnoFJuK0A` |
| `VAPID_PRIVATE_KEY` | `G2o2s9UsFNNV-2yp7rixHjS1qeLfEtwLJ3eI-tKowxQ` |
| `VAPID_SUBJECT` | `mailto:your-email@example.com` |
| `CRON_SECRET` | `8c10fcb5e9bf077da10a459e3da6cdef6e32c427191fadf3` |
| `SUPABASE_SERVICE_ROLE_KEY` | *(paste from Step 1B)* |

5. Click **Deploy**
6. Copy your live URL (e.g. `https://habit-tracker-xxx.vercel.app`)

---

## Step 4 — Configure Supabase auth for production

In Supabase → **Authentication** → **URL Configuration**:

| Field | Value |
|-------|-------|
| **Site URL** | `https://YOUR-VERCEL-URL.vercel.app` |
| **Redirect URLs** | `https://YOUR-VERCEL-URL.vercel.app/**` |

Click **Save**.

---

## Step 5 — Enable phone notifications

1. Open your **live Vercel URL** on your phone
2. Sign up / log in
3. **Settings** → enable morning (7:30 AM) + evening (9:00 PM) → **Save notifications**
4. Allow notifications when prompted
5. **Add to Home Screen** (Safari Share menu on iPhone)

Vercel cron (`vercel.json`) sends push every minute check at Lebanon time once `SUPABASE_SERVICE_ROLE_KEY` is set.

---

## Step 6 — Verify cron (optional)

```bash
curl -H "Authorization: Bearer 8c10fcb5e9bf077da10a459e3da6cdef6e32c427191fadf3" \
  https://YOUR-VERCEL-URL.vercel.app/api/cron/reminders
```

Should return `{"ok":true,"sent":0}` (or higher if reminders fired).

---

## CLI deploy (alternative)

If you prefer terminal:

```bash
npx vercel login
npx vercel link
npx vercel env add NEXT_PUBLIC_SUPABASE_URL
# ... add all env vars above
npx vercel --prod
```

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| Can't sign up on live site | Add Vercel URL to Supabase redirect URLs |
| Notifications don't work | Add app to home screen; check VAPID keys in Vercel env |
| Cron returns 401 | `CRON_SECRET` must match in Vercel env |
| Push not sent when app closed | Ensure `SUPABASE_SERVICE_ROLE_KEY` is set on Vercel |
