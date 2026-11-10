# Restore visitor analytics tracker

Extract this zip into the repo root (C:\Users\ALEX ASMO\Downloads\HazelSite2),
overwriting when asked. Three files:

- apps/site/src/components/visit-tracker.tsx   (new)
- apps/site/src/app/api/visit/route.ts         (new)
- apps/site/src/app/layout.tsx                 (modified: import + <VisitTracker /> after <Analytics />)

Then:

  git add -A
  git commit -m "feat: restore visitor analytics consent tracker + telegram notifier"
  git push
