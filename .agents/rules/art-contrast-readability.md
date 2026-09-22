---
title: Tone Encodes Interactivity
impact: HIGH
impactDescription: tells the player what can be touched when colour cannot
tags: art, contrast, readability
---

## Tone Encodes Interactivity

With three hues that share one warm family, tone contrast is the channel used to separate what
the player interacts with from what is decoration. Three obligations:

1. Everything the player collides with — platforms, enemies, thieves, hazards — uses the
   dark end of the palette: **`sertao`, `umber`, `ink`**, outlined in `ink`.
2. Purely decorative elements — backgrounds, parallax — stay in **`bone`, `dust`, `clay`**
   and never compete in contrast with playable elements.
3. Two adjacent tones (for example `umber` on `ink`) never touch without an outline
   between them. Hiding a decorative element against the background can be intentional;
   hiding anything the player must reach or dodge never is.

Trigger points — the puzzle altar, ammo pickups, coins — must read as interactive by
tone alone: outline plus a high-contrast tone. Never rely on a tint to say "this is
interactive".

Reference: `.agents/docs/guidelines.md` §6, §9
