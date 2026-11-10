# HazelSite — complete setup guide

Two independent Next.js apps, two Vercel Blob stores, no database and no separate API server.
This guide covers running everything locally, then shipping it to Vercel.

| App | Path | Purpose | Default local port |
| --- | --- | --- | --- |
| Public site | `apps/site` | Marketing pages, blog, contact form | 3000 |
| Admin HQ | `apps/hq` | Command Centre, Posts, Messages, Blog Images, Analytics, Settings | 3001 |

The two apps are **not** a monorepo workspace: each has its own lockfile and must be installed
separately. The HQ has no database, Go/gRPC API, Postgres, Supabase, or S3/R2 dependency — all
content and image storage goes through Vercel Blob.

---

## 1. Requirements

- **Node.js 22.x LTS** for the HQ (Vercel must run 22.13 or newer).

  Node 20 also works locally if you use pnpm 10.x — pnpm 11 requires `node:sqlite`, which only
  exists in Node 22.5+. If `pnpm install` dies with `ERR_UNKNOWN_BUILTIN_MODULE: node:sqlite`,
  that is this mismatch, not your project.
- **pnpm** for `apps/hq` (lockfile: `pnpm-lock.yaml`, pinned via `packageManager`).
- **npm** for `apps/site` (lockfile: `package-lock.json`).
- A Vercel account with **two** Blob stores (one private, one public) for anything beyond a
  read-only look at the UI.

---

## 2. Install dependencies

```bash
# HQ
cd apps/hq
corepack pnpm@10.8.1 install --frozen-lockfile

# Public site
cd ../site
npm install --legacy-peer-deps
```

`--legacy-peer-deps` is required for the site; the repository carries a pre-existing React peer
conflict.

---

## 3. Environment variables

Templates live next to each app. Copy the template to the git-ignored `.env.local` and fill it in:

```bash
cp apps/hq/.env.example apps/hq/.env.local
cp apps/site/.env.example apps/site/.env.local
```

### `apps/hq/.env.local`

| Variable | Required | What it is |
| --- | --- | --- |
| `ADMIN_EMAIL` | yes | The only account allowed to sign in |
| `ADMIN_PASSWORD_HASH` | yes | bcrypt hash of your admin password |
| `ADMIN_TOTP_SECRET` | yes | Base32 TOTP secret for the authenticator app |
| `ADMIN_SESSION_SECRET` | yes | ≥32 characters, signs session cookies |
| `ADMIN_RECOVERY_CODE_HASHES` | yes | JSON array of bcrypt hashes of one-time recovery codes (`[]` to disable) |
| `CONTENT_BLOB_READ_WRITE_TOKEN` | for content | **Private** store: post JSON, contact messages, recovery-code state |
| `MEDIA_BLOB_READ_WRITE_TOKEN` | for images | **Public** store: blog images |
| `NEXT_PUBLIC_APP_URL` | yes | HQ's own URL (`http://localhost:3001` locally) |
| `NEXT_PUBLIC_BLOG_URL` | yes | Public site URL (`http://localhost:3000` locally) |
| `NEXT_PUBLIC_SITE_NAME` | optional | Display name in the HQ chrome |

### `apps/site/.env.local`

| Variable | Required | What it is |
| --- | --- | --- |
| `CONTENT_BLOB_READ_WRITE_TOKEN` | for content | The **same private** store token as the HQ |
| `NEXT_PUBLIC_SITE_URL` | recommended | Canonical site URL |
| `HQ_URL` | recommended | HQ URL, used by the site's `/admin` redirect |

Never put a Blob token, password hash, TOTP secret, or session secret in a `NEXT_PUBLIC_*`
variable — those are inlined into the browser bundle.

---

## 4. Generate the admin credentials

Run this from `apps/hq`, on your own machine. It prompts for an email and a password (12+
characters) and prints ready-to-paste variable values:

```bash
cd apps/hq
node scripts/create-vercel-admin-secrets.mjs
```

It outputs:

- `ADMIN_EMAIL` and `ADMIN_PASSWORD_HASH`
- `ADMIN_TOTP_SECRET` plus an `otpauth://` setup URI (import into Google Authenticator, 1Password,
  Aegis, etc.)
- `ADMIN_SESSION_SECRET`
- `ADMIN_RECOVERY_CODE_HASHES` and **ten plaintext one-time recovery codes** — these are shown
  once; store them in a password manager

Rules: never commit the output, never paste it into chat or a ticket, and regenerate everything if
it leaks. Changing `ADMIN_SESSION_SECRET` invalidates all existing sessions.

Without a Blob token, recovery codes cannot be consumed — the used-code ledger lives in the
private store. Password + TOTP still work.

---

## 5. Run locally

Two terminals, because both apps default to port 3000:

```bash
# Terminal 1 — HQ
cd apps/hq
corepack pnpm@10.8.1 dev --port 3001

# Terminal 2 — public site
cd apps/site
npm run dev
```

- Site: <http://localhost:3000>
- HQ: <http://localhost:3001> (redirects to `/login`)

Sign-in flow: email + password → 6-digit authenticator code (or a recovery code) → you land on the
Command Centre.

### What works without Blob tokens

The UI loads, but every content endpoint degrades honestly instead of crashing:

- `/api/overview` returns zero counts and `storage_configured: false`; the dashboard shows dashes
  and a note that content storage is not configured.
- `/api/posts`, `/api/contact`, `/api/storage` return empty lists with the same flag.
- **Writes fail** — creating or deleting posts, deleting messages, and uploads return `503`. That
  is correct behaviour, not a bug; add the tokens to make them work.

---

## 6. Production build, checked locally

Always run a build before deploying — it catches type, prerender, and header-config errors.

```bash
cd apps/hq
corepack pnpm@10.8.1 build
corepack pnpm@10.8.1 start --port 3001

cd ../site
npm run build
npm start
```

Two things to expect in a production build:

- Session cookies are issued with `Secure`, so use HTTPS or `http://localhost` (browsers treat
  localhost as a secure context). A plain-HTTP LAN IP will not keep you signed in.
- The HQ sends `X-Frame-Options: DENY` and a strict CSP. The dashboard is deliberately
  non-embeddable — do not put it in an iframe.

If the build runs out of memory, raise the heap: `NODE_OPTIONS=--max-old-space-size=4096`.

---

## 7. Publish the code to GitHub

The working copy is a real repository. `.gitignore` excludes `node_modules`, `.next`, `.env*`
(except `.env.example`), `.vercel`, and `*.tsbuildinfo`, so no local secrets or build output can be
pushed. Keep the repository **private** — the HQ source reveals your auth design.

### Option A — push to the existing repo as a new branch (recommended)

This branch is already prepared locally: `vercel-only`, built on top of the repo's current `main`
so history stays connected.

**If you already have a clone of the repo:**

```bash
cd /path/to/HazelSite
git fetch /path/to/hazelsite-vercel-only.bundle vercel-only:vercel-only
git push origin vercel-only
```

Then open a pull request from `vercel-only` into `main`, or deploy that branch directly.

**If you do not have a clone**, clone the bundle first, then push it to GitHub:

```bash
git clone -b vercel-only /path/to/hazelsite-vercel-only.bundle HazelSite
cd HazelSite
git remote set-url origin https://github.com/<your-username>/HazelSite.git
git push -u origin vercel-only
```

The bundle records complete history, so the pushed branch shares the repo's `main` ancestry instead
of looking like an unrelated import.

### Option B — a brand new repository

```bash
cd HazelSite2
gh auth login                       # once per machine
gh repo create HazelSite --private --source=. --remote=origin --push
```

Or on github.com: create the repo **Private**, with no README/.gitignore/licence, then:

```bash
cd HazelSite2
git remote add origin git@github.com:<your-username>/HazelSite.git
git push -u origin vercel-only
```

### Before you push, confirm nothing private is staged

```bash
git status --short              # expect no output
git ls-files | grep -E '\.env'  # expect only the .env.example files
```

If a real `.env` file ever gets committed, rotate every value in it — deleting it in a later commit
does not remove it from history.

### Optional: drop the legacy services

`services/api` (the old Go/gRPC API) and `docker-compose.yml` (Postgres) are leftovers from the
pre-Vercel architecture. Nothing in `apps/site` or `apps/hq` imports them, and Vercel ignores them
because each project's Root Directory is an app folder. Keep them for reference, or remove them in a
follow-up commit:

```bash
git rm -r services docker-compose.yml && git commit -m "Remove legacy Go API and Postgres compose"
```

## 8. Deploy to Vercel

Import the **same Git repository twice**, one project per app:

| Project | Root Directory | Install command | Framework |
| --- | --- | --- | --- |
| Public site | `apps/site` | `npm install --legacy-peer-deps` | Next.js |
| Admin HQ | `apps/hq` | `pnpm install --frozen-lockfile` (Corepack) | Next.js |

Set the Node.js version to **22.13+** on both projects. Give the site your public domain and the
HQ a separate subdomain such as `hq.example.com`. Do not deploy the HQ on the same hostname as the
site.

Then set the environment variables from section 3 in each project (Production, and Preview if you
want preview deploys to work). Use the real HTTPS URLs:

- HQ: `NEXT_PUBLIC_APP_URL=https://hq.example.com`, `NEXT_PUBLIC_BLOG_URL=https://example.com`
- Site: `NEXT_PUBLIC_SITE_URL=https://example.com`, `HQ_URL=https://hq.example.com`

Redeploy after adding or changing variables so they reach the running functions.

---

## 9. Blob stores

Create both under Vercel → Storage → Blob:

1. **Content store — private access.**
   Reads/writes published post JSON, contact messages, and the recovery-code ledger.
   Expose its token as `CONTENT_BLOB_READ_WRITE_TOKEN` in **both** projects.
2. **Media store — public access.**
   Holds blog images that the public site displays by URL.
   Expose its token as `MEDIA_BLOB_READ_WRITE_TOKEN` in the **HQ only**.

Do not swap them. Private post/message JSON in a public store would be world-readable. If Vercel
injects a default variable name when you connect a store, copy the token into the explicit name
above — the apps read those exact names.

Image uploads from the HQ are limited to 4 MB, formats PNG, JPEG, WebP, GIF, AVIF.

---

## 10. First-run smoke test

Locally or on the deployment, in this order:

1. Public site and blog render; bundled Markdown posts appear even with an empty content store.
2. Submit the contact form, confirm the message appears in HQ → Messages, then delete it.
3. Sign in to the HQ with email + password + TOTP. Confirm `/login` redirects away once signed in.
4. Create a draft → publish → confirm it appears on the public blog → unpublish/delete it.
5. Upload a small image in HQ → Blog Images, attach it to a post, confirm it renders publicly,
   then delete the image.
6. Confirm the Overview counts match reality and Vercel Analytics records traffic (data is not
   instant).
7. Sign out, then hit an HQ URL directly — you must be redirected to `/login`.

---

## 11. How authentication actually works

Useful when something misbehaves:

1. `POST /api/auth/login` compares the email against `ADMIN_EMAIL` and bcrypt-compares the
   password. On success it returns a **5-minute** signed `2fa` token.
2. `POST /api/auth/2fa/verify` accepts a 6-digit TOTP (validated with a ±1 step / ±30 s window) or
   an unused recovery code. Recovery codes are bcrypt-hashed, single-use, and the used-index
   ledger is written to the private Blob store at `auth/recovery-used.json`.
3. On success it issues `realm_auth_token`: HTTP-only, `SameSite=Lax`, `Secure` in production,
   8-hour expiry, HMAC-SHA256 signed with `ADMIN_SESSION_SECRET`.
4. `proxy.ts` guards every page; every `/api/*` route calls `requireAuth`. No session, no data.
5. Repeated wrong passwords are throttled (12 failures per 15-minute window → HTTP 429).

There is no self-service signup, password reset, or multi-user support. One admin, one email.

---

## 12. Troubleshooting

| Symptom | Cause and fix |
| --- | --- |
| "The verification code is invalid or expired" | Clock drift, or the code expired while typing. Check the device clock, or use a fresh recovery code. |
| "Admin sign-in is not configured yet" (503) | `ADMIN_EMAIL`, `ADMIN_PASSWORD_HASH`, `ADMIN_TOTP_SECRET`, or `ADMIN_SESSION_SECRET` missing. |
| API returns 401 in the browser | Session cookie missing/expired, or `ADMIN_SESSION_SECRET` changed since sign-in. Sign in again. |
| `/api/posts`, `/api/contact`, `/api/storage` return 503 | Blob token missing or wrong store. Check the exact variable name and private/public pairing. |
| Dashboard shows dashes and "content storage isn't configured" | `CONTENT_BLOB_READ_WRITE_TOKEN` is unset — expected. |
| `ERR_UNKNOWN_BUILTIN_MODULE: node:sqlite` on install | pnpm 11 on Node 20. Use `corepack pnpm@10.8.1`, or move to Node 22. |
| Site install fails on peer dependencies | Use `npm install --legacy-peer-deps`. |
| Stale errors after code changes | Delete the build cache: `rm -rf apps/hq/.next apps/site/.next`, restart. |
| Build killed on a small machine | `NODE_OPTIONS=--max-old-space-size=4096`. |
| Signed out on a plain-HTTP host | `Secure` cookies require HTTPS or `localhost`. |

---

## 13. Notes and limits

- **No data migration is included.** Anything in the old database, Go API, or S3/R2 bucket must be
  exported and re-created (or re-uploaded) by hand.
- **Blob quotas and billing** follow your Vercel plan; check current usage before uploading large
  media or expecting high traffic. Hobby quotas can pause access until the cycle resets.
- **Bundled Markdown posts** in the site remain as a fallback so the blog is never empty.
- **Recovery codes are single-use** and require the private Blob store; without it, use the
  authenticator app.
- **Strict security headers** are applied to the HQ (framebusting + CSP). Serving it inside an
  iframe or a third-party preview panel will show a blank frame — that is intentional.
- **Only `/api/*` JSON is unauthenticated** where explicitly marked (the site's public post reads
  and contact submission). Everything in the HQ requires a session.
