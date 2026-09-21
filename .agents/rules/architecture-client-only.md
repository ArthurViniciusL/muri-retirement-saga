---
title: Client-Only Static Build
impact: HIGH
impactDescription: keeps the game deployable as static files with no backend
tags: architecture, deploy, scope
---

## Client-Only Static Build

The game is a pure client-side application served as a static build on Vercel. There is
no backend, no authentication, no database and no persistence of any kind — not across
devices, not across sessions, not even across a page reload. Each guest plays alone on
their own phone, with no network synchronisation between players.

Consequences that are easy to violate by accident:

- No `fetch` to any API, no analytics, no remote configuration, no font or asset loaded
  from a CDN at runtime. Everything ships in the bundle.
- No `localStorage` or `sessionStorage` for progress, high scores or settings. Progress
  exists only in memory while the tab is open.
- No lives, no continues, no checkpoints, no saves. Game over restarts the current
  phase from the beginning.
- No per-guest customisation. Every guest receives the same build.

**Incorrect:**

```ts
localStorage.setItem('muri:coins', String(this.coins)); // persistence is out of scope
```

**Correct:**

```ts
// Coins live in the CurrencySystem for the lifetime of the run and nowhere else.
this.currency.add(1);
```

Reference: `.agents/docs/system-design.md` §1, §2, §19
