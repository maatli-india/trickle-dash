# trickle-dash

Admin dashboard for the Trickle platform — configuration (feature flags, safety thresholds, prohibited categories), content (Privacy Policy, Terms, FAQ, parcel-declaration liability text), announcements, and a data console (users, parcel requests, trips, reports) with ban/unban and report-review actions.

Next.js 16 (App Router) + TypeScript + Tailwind 4, themed to match the Trickle mobile app's functional screens (Home, Account, Reports). Every read and write goes through the `transitorder` Go backend — this app has no database of its own and no business logic beyond thin Server Actions that call the backend's admin API.

## Setup

1. **Bootstrap the first admin account** (run from the `transitorder` repo, requires access to the same MongoDB the backend uses):

   ```bash
   go run ./cmd/seed-admin -username admin -password "at-least-8-characters" -mongo-uri "$MONGO_URI" -db trickle
   ```

2. **Configure this app**:

   ```bash
   cp .env.example .env.local
   # edit .env.local — API_BASE_URL should point at your running transitorder backend
   ```

3. **Install and run**:

   ```bash
   npm install
   npm run dev
   ```

4. Open `http://localhost:3000`, log in with the admin account from step 1.

## How it's wired

- `src/lib/session.ts` — the admin's access token lives in an httpOnly cookie. Admin tokens from the backend are stateless with no refresh flow (see `authSessionManager.createAdminAccessToken` in `transitorder`), so this cookie is just a thin wrapper around that one token; re-login is required after it expires.
- `src/lib/api.ts` — the only place that calls the backend. Every Server Component page and Server Action goes through this, so the admin token never reaches the browser.
- `src/lib/actions/*` — Server Actions per domain (`auth`, `config`, `content`, `announcements`, `users`, `reports`), each a thin wrapper around one backend endpoint.
- `middleware.ts` — gates every `/dashboard/*` route on a valid session cookie.

See `transitorder/docs/admin-dashboard.md` for the full backend API surface this app depends on.

## What's not here yet

- No admin/super_admin permission split in the UI — every admin account can do everything.
- The mobile app doesn't poll `GET /v1/announcements/active` yet, so announcements created here aren't visible in-app until that client-side wiring is done.
- Legal content (Privacy Policy, Terms, FAQ, parcel-declaration liability text) ships with engineering-drafted placeholder text — see the note on the Content page. It needs review by qualified counsel before it's real.
