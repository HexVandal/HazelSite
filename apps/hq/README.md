# HazelSite HQ

Admin dashboard for the HazelSite public site. This Vercel-only copy keeps the existing HQ styling and provides Posts, Messages, Overview counts, Blog Images, Analytics (Vercel dashboard link), and visual Settings.

## Local development

From this folder, install with the existing pnpm lockfile and run the Next.js app:

```bash
corepack pnpm install
corepack pnpm dev
```

For authentication and Blob-backed content operations, configure the server-side variables from `.env.example` in a local ignored `.env.local` or in Vercel. Generate admin values locally with:

```bash
node scripts/create-vercel-admin-secrets.mjs
```

Do not commit or share the generated password hash, TOTP/session secrets, recovery-code hashes, or one-time recovery codes.

## Deployment

Create a separate Vercel project with Root Directory `apps/hq`. Connect the private content Blob store and public media Blob store, and set the matching admin and URL variables. Full project/store setup and smoke tests are in [`../../SHIPPING_SETUP.md`](../../SHIPPING_SETUP.md).

This project does not require the legacy Go/gRPC API, a database, or S3-compatible storage. Blog image uploads support PNG, JPEG, WebP, GIF, and AVIF up to 4 MB.
