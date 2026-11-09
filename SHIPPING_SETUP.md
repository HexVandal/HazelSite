# HazelSite shipping notes

This is a cleaned **source bundle for deployment**, not a deployed or production-configured site. The original Drive archive is unchanged. The archive's `.env` was deliberately excluded; if it contained real credentials, rotate them before redistributing the original archive.

## What remains

- Public website: `apps/site`
- Admin HQ: `apps/hq`
- Go HTTP + gRPC API: `services/api`
- Source assets, content, database schemas, tests, generated protobuf code, OpenAPI specs, deployment files, licenses and third-party notices
- Local Docker Compose for development/testing

One-off patch scripts/notes, local editor settings, the local HQ setup helper, redundant deployment narratives, and duplicate package-manager lockfiles were removed. The website retains npm's `package-lock.json`; HQ retains pnpm's `pnpm-lock.yaml` (the package manager its Dockerfile uses).

## Choose before shipping

1. Choose production domains, e.g. `example.com`, `hq.example.com`, and `api.example.com`.
2. Choose hosting. The website and HQ can be separate Vercel projects in the same repo, with roots `apps/site` and `apps/hq`. Host the Go API separately on a platform supporting both HTTP and gRPC.
3. Provision managed PostgreSQL and create **separate site and API databases**. Do not point both apps at the same database: their schemas contain incompatible tables with overlapping names.
4. Provision persistent S3-compatible object storage for API uploads. Do not use container-local disk for production uploads.
5. Configure production secrets in each host's server-side environment-variable settings. Never commit `.env` or expose private keys through `NEXT_PUBLIC_*` variables.
6. Configure the first admin account as described below, then restrict/disable open registration after bootstrap.
7. Set OAuth redirect URLs and CORS/origin allowlists to the final HTTPS domains only.
8. Test site routes, HQ login/admin pages, API health, contact notifications, storage persistence and `/api/visit` before directing traffic.

## Environment variables to set

### Go API host — `services/api`

Required/production-critical:

- `ENVIRONMENT=production`
- `PORT`, `GRPC_PORT` (match the platform's HTTP and gRPC listener configuration)
- `DATABASE_URL` (dedicated API database, TLS settings per provider)
- `PASETO_SYMMETRIC_KEY` (fresh random 32-byte key, 64 hex characters)
- `ALLOWED_ORIGINS` (final website and HQ HTTPS origins)
- `FRONTEND_URL` (public website URL)
- `SUPERADMIN_EMAILS` (initial admin email)
- `STORAGE_BACKEND=s3`, `S3_ENDPOINT`, `S3_REGION`, `S3_BUCKET`, `S3_ACCESS_KEY_ID`, `S3_SECRET_ACCESS_KEY`, `S3_USE_PATH_STYLE`; optionally `S3_PUBLIC_DOMAIN`

Optional integrations: `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID`, SMTP settings, `DISCORD_WEBHOOK_URL`, Last.fm credentials, Google/GitHub OAuth credentials and exact callback URL variables. Keep these server-side.

### HQ host — `apps/hq` (Vercel root `apps/hq`)

- `NODE_ENV=production`
- `API_URL=https://<api-domain>` (server-side HTTP endpoint)
- `GRPC_API_URL=<api-host>:<grpc-port>` (reachable gRPC endpoint)
- `API_TOKEN` (scoped token created after API bootstrap)
- `SUPERADMIN_EMAILS` (same initial admin email)
- `NEXT_PUBLIC_APP_URL=https://<hq-domain>`
- `NEXT_PUBLIC_API_URL=https://<api-domain>`
- `NEXT_PUBLIC_BLOG_URL=https://<site-domain>`
- `NEXT_PUBLIC_SITE_NAME`; `REVALIDATION_SECRET` if that workflow is enabled

Confirm the HQ runtime can reach gRPC. Vercel may not support every arbitrary outbound gRPC arrangement; validate the host/network design before committing to this deployment topology.

### Public website — `apps/site` (Vercel root `apps/site`)

- `DATABASE_URL` (dedicated site database; not the API DB)
- `SESSION_SECRET` (fresh random secret, at least 32 characters)
- `ADMIN_SETUP_TOKEN` (one-time bootstrap token; rotate/remove after setup)
- `NEXT_PUBLIC_SITE_URL=https://<site-domain>`
- `HQ_URL=https://<hq-domain>`
- `GLOOM_API_INTERNAL_URL=https://<api-domain>` for server-side API calls that require it

## Initial HQ administrator

Set `SUPERADMIN_EMAILS` to the chosen admin email on the API host and HQ host. Register the user over HTTPS with `POST https://<api-domain>/v1/auth/register` using JSON fields `email`, `username`, `full_name`, and `password` (at least 8 characters). Restart/redeploy the API so it bootstraps that user as a superadmin, then sign in at `https://<hq-domain>/login`. The registration endpoint must be restricted or disabled after initial setup; do not leave unrestricted sign-ups enabled for production. Enroll TOTP after login and store recovery codes securely.

## URL compatibility

Existing public, HQ and API paths/handles are retained. `/admin` behavior is unchanged. Only introduce redirects if a URL is intentionally renamed, and test old links. OAuth callbacks must use the final production API domain.

## Local Compose

Use `docker compose up --build` at the repository root for local testing only. Compose creates separate `hazel` and `realm_api` databases. Its local storage configuration is not suitable for durable production uploads.
