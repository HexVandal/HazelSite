# HazelSite

Personal portfolio and blog with a companion admin HQ. This working copy is configured for Vercel-only hosting; it does not need the legacy Go/gRPC API, database, or S3-compatible storage for the supported site/HQ features.

## Apps

- `apps/site` — public Next.js website, Markdown/Blob-backed blog, contact form, Vercel Analytics.
- `apps/hq` — admin dashboard for posts, contact messages, blog images, overview counts, analytics link, and visual settings.
- `services/api` — retained source from the original project; it is not used by these Vercel-only apps.

## Local development

Public site:

```bash
cd apps/site
npm install --legacy-peer-deps
npm run dev
```

Admin HQ:

```bash
cd apps/hq
corepack pnpm install
corepack pnpm dev
```

Blob-backed features and admin authentication require server-side environment values. Do not commit local `.env` files. Generate admin environment values locally with `node scripts/create-vercel-admin-secrets.mjs` from `apps/hq`; keep the generated TOTP/session secrets and one-time recovery codes private.

## Vercel deployment

Create two Vercel projects from the repository, with Root Directories `apps/site` and `apps/hq`. Connect a private Blob store for post/message JSON and a public Blob store for blog images, then configure the project variables. Read [`SHIPPING_SETUP.md`](SHIPPING_SETUP.md) for the exact setup and smoke-test checklist.

No deployment or push has been performed from this working copy.
