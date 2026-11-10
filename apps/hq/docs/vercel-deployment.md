# Vercel deployment

For the current Vercel-only architecture, use the setup and smoke-test guide at [`../../../SHIPPING_SETUP.md`](../../../SHIPPING_SETUP.md).

The HQ is a separate Next.js Vercel project rooted at `apps/hq`. It uses signed admin sessions, TOTP, private Vercel Blob for post/message content, and public Vercel Blob for images. The former Go/gRPC deployment settings in older copies of this document are obsolete and must not be configured for this working copy.
