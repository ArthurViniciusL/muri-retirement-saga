---
title: Tone Encodes Interactivity
impact: HIGH
impactDescription: tells the player what can be touched when colour cannot
tags: art, contrast, readability
---

## Tone Encodes Interactivity

In a monochrome palette, tone contrast is the only channel available to separate what
the player interacts with from what is decoration. Three obligations:

1. Everything the player collides with — platforms, enemies, thieves, hazards — uses the
   darkest, highest-contrast tones: **zinc-700 to zinc-950**.
2. Purely decorative elements — backgrounds, parallax — stay in **zinc-50 to zinc-500**
   and never compete in contrast with playable elements.
3. Two adjacent tones (for example zinc-800 on zinc-900) never touch without an outline
   between them. Hiding a decorative element against the background can be intentional;
   hiding anything the player must reach or dodge never is.

Trigger points — the puzzle altar, ammo pickups, coins — must read as interactive in
greyscale: outline plus a high-contrast tone. Never rely on a tint to say "this is
interactive".

Reference: `.agents/docs/guidelines.md` §6, §9
