---
title: "Rebuilding the site because I got bored"
description: "Notes from a weekend of deleting good code and replacing it with slightly different good code."
createdAt: "2026-09-18"
updatedAt: "2026-09-21"
tags: ["nextjs", "web", "code"]
---

Every six months I decide the site is broken. It is never broken. I just get
bored of looking at it, and the fastest way to feel something is to rewrite the
layout and pretend it's a performance issue.

This time I actually learned a few things worth writing down.

## The actual problem

The old version shipped a mega-bundle of every component I had ever written.
Half of it was never rendered. The other half was rendered twice. The fix was
boring:

| Before | After | Change |
| --- | --- | --- |
| Client boundary at the page | Client boundary at the widget | −62% JS |
| Font fetched twice | One variable font | −180 KB |
| Images unoptimised | `next/image` + blur | way less layout shift |

Boring fixes are always the real fixes. Nobody wants to hear that. I don't want
to hear that. But `date` says the fastest page is the one you stop shipping.

## Small things that added up

1. **Route-level loading states.** Not a spinner over the whole page — a
   skeleton that matches the final layout so nothing jumps.
2. **Real `alt` text.** Not `alt="image"`. It's two seconds of effort and it's
   the difference between a site and a PDF.
3. **One accent colour.** Previously I had four. It looked like a dashboard
   built by committee.

## On motion

Animation is salt, not a food group. A little hover lift makes a card feel
alive. A parallax scroll on every section makes me want to close the tab.

```tsx
// Good motion: short, cheap, and responds to the user.
<motion.div whileHover={{ y: -2 }} transition={{ duration: 0.15 }}>
  {children}
</motion.div>
```

Bad motion is anything that makes you wait for the interface to finish feeling
itself. If a transition is longer than 300ms, someone is showing off.

## The maths of "done"

There is no completion state. There's only a version of the site you can stand
looking at for the next few months, and the knowledge that the loop will start
again. If you can live with that, the work gets easier:

$$ \text{progress} = \frac{\text{things that annoy you}}{\text{things that annoy you} + \text{things you notice}} $$

That denominator only goes up. Ship anyway.
