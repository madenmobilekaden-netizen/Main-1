# Drywall CRM — Setup Guide

## 1. Create a Supabase Project

1. Go to supabase.com → New Project
2. Note your **Project URL** and **anon public key** (Settings → API)

## 2. Run the Database Migration

In Supabase Dashboard → SQL Editor, paste and run the entire contents of:
```
supabase/migrations/001_initial_schema.sql
```

## 3. Configure Environment Variables

```bash
cp .env.example .env
```

Edit `.env`:
```
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhb...
```

## 4. Create Your Owner Account

In Supabase Dashboard → Authentication → Users → Add User:
- Email: your email
- Password: your password

Then in SQL Editor, manually insert your owner profile:
```sql
insert into public.profiles (id, email, role, active)
values (
  'your-user-uuid-from-auth-users-table',
  'you@email.com',
  'owner',
  true
);
```
(Find your UUID in Authentication → Users)

## 5. Run the App

```bash
npm install
npm run dev
```

Open http://localhost:5173 and sign in with your owner credentials.

---

## Phase 2: Crew Leader Invites

Deploy the edge functions so invite emails work:

```bash
npm install -g supabase
supabase login
supabase link --project-ref your-project-ref
supabase functions deploy invite-crew-leader
supabase functions deploy notify-stage-change
```

Set edge function secrets in Supabase Dashboard → Settings → Edge Functions → Secrets:
```
SITE_URL = https://your-deployed-url.com
RESEND_API_KEY = re_xxxx  (get from resend.com — free tier works)
```

Then from the app: Crews tab → "Invite Crew Leader" → enter email → send.

---

## Phase 3: Photos

The storage bucket (`job-photos`) is created automatically by the migration SQL.
Photos are stored publicly in Supabase Storage. Crew leaders can upload
directly from their phone camera using the "Add Photo" button on each job.

---

## Deployment (Production)

```bash
npm run build
```

Deploy the `dist/` folder to Vercel, Netlify, or any static host.
Set the same env vars (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`) in your host's dashboard.
