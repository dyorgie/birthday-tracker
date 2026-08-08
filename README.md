# Birthday Tracker

A simple, no-login birthday tracker with push notification reminders. Installable as a PWA on iOS, Android, and desktop.

## Features

- Add/edit/delete birthdays, no account required
- Choose reminder timing per birthday: 1 week, 3 days, 1 day, and/or day-of
- Real push notifications (via Web Push), even when the app is closed
- Installable as an app (Add to Home Screen on iOS, Install app on Android/desktop)
- Private per-visitor lists (each browser gets its own anonymous ID — no one else can see your list)

## Tech stack

- **Frontend:** React + Vite
- **Backend:** Vercel Serverless Functions (in `api/`)
- **Database:** Neon Postgres (via Vercel Storage)
- **Notifications:** Web Push API + VAPID, triggered daily via Vercel Cron
- **Hosting:** Vercel (Hobby/free tier)

## How it works

- Each visitor is assigned a random anonymous ID on first visit, stored in `localStorage`. All their birthdays and their push subscription are tied to this ID — there's no login, so this ID is effectively "who you are" to the app.
- A daily cron job (`api/cron/send-reminders.js`) runs once a day, checks every birthday against today's date, and sends a push notification to anyone whose reminder settings match.
- The service worker (`public/sw.js`) receives push messages in the background and displays them as OS-level notifications, even if the app isn't open.

## Local development setup

1. Install dependencies:
   ```powershell
   npm install
   ```

2. Pull environment variables from Vercel (requires being logged in via `vercel login` and the project linked via `vercel link`):
   ```powershell
   vercel env pull .env.local
   ```

3. Run the local dev server (serves both frontend and API together):
   ```powershell
   vercel dev
   ```

4. Open `http://localhost:3000`

## Environment variables

These are all managed through Vercel (`vercel env add` / `vercel env pull`), never committed to the repo:

| Variable | Purpose |
|---|---|
| `DATABASE_URL` | Neon Postgres connection string |
| `VAPID_PUBLIC_KEY` | Public key for Web Push (safe to expose to frontend) |
| `VAPID_PRIVATE_KEY` | Private key for Web Push (server-only, keep secret) |
| `CRON_SECRET` | Random string used to authenticate calls to the cron endpoint |

## Database schema

**`birthdays`** — one row per birthday entry, scoped to `user_id`
- `id`, `name`, `dob`, `notify_week`, `notify_three_day`, `notify_one_day`, `notify_day_of`, `user_id`, `created_at`

**`subscriptions`** — one row per anonymous visitor's push subscription
- `user_id` (primary key), `subscription` (jsonb), `created_at`

## Manual scripts

One-off scripts used during setup/migrations (not part of the running app):

- `setup-db.js` — creates the initial `birthdays` table
- `fix-schema.js` / `fix-schema-2.js` — early migrations (subscriptions table, user_id scoping)
- `check-birthdays.js` / `check-subscriptions.js` — debug scripts to peek at raw DB contents

Run any of these with:
```powershell
node --env-file=.env.local <script-name>.js
```

## Deployment

Deploys automatically via Vercel when pushed to `main`. To deploy manually:
```powershell
vercel --prod
```

The cron job (`vercel.json`) only runs on deployed (production) environments — it does not run during local `vercel dev`.

## Known limitations

- No accounts — each browser/device has its own separate list. Clearing browser data or switching devices loses access to that list (there's no recovery mechanism yet).
- iOS push notifications only work if the app was installed via "Add to Home Screen" in Safari — they won't work in a regular Safari tab.
- Currently free-tier only (Vercel Hobby + Neon free tier) — intended for personal/non-commercial use with a small group of users.

## Roadmap

- [ ] Optional accounts + ability to "claim" an anonymous list after signing up
- [ ] Edit existing entries
- [ ] Filtering (upcoming X, by month)
- [ ] Notes/gift ideas per entry
- [ ] Age display (optional year input)
- [ ] In-app notification history