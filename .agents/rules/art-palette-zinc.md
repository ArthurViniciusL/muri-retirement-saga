---
title: Zinc Palette, No Exceptions
impact: HIGH
impactDescription: the monochrome constraint is the game's visual identity
tags: art, palette, color
---

## Zinc Palette, No Exceptions

The game is strictly monochrome, on the shadcn/Tailwind `zinc` scale. No hue outside
this table appears anywhere in the game — not in sprites, tiles, HUD, puzzle cards or
particles. The single exception is Muri's frames, shown from the owner's drawings
(`art-grid-and-scale.md`).

| Tone | Hex | Use |
| --- | --- | --- |
| zinc-50 | `#FAFAFA` | lightest background, "paper" |
| zinc-100 | `#F4F4F5` | secondary background, breathing room |
| zinc-200 | `#E4E4E7` | far parallax layer |
| zinc-300 | `#D4D4D8` | mid-distance background |
| zinc-400 | `#A1A1AA` | background scenery elements |
| zinc-500 | `#71717A` | mid tone, hatching shadow |
| zinc-600 | `#52525B` | soft outlines, internal sprite detail |
| zinc-700 | `#3F3F46` | foreground silhouettes |
| zinc-800 | `#27272A` | main outlines of characters and enemies |
| zinc-900 | `#18181B` | highlight stroke, text on light background |
| zinc-950 | `#09090B` | deepest contrast, use sparingly for the woodcut carve |

A single sprite uses at most **three or four tones** at once — for example zinc-950 for
the outline, zinc-700 for shadow, zinc-100 for light, zinc-50 for the sprite's own
background. Using the whole scale in one element reads as a soft gradient, which is
forbidden.

This diverges from the shared "Cordel Arcade" design system, which keeps its three-colour
palette for the party invitation. Inside this repository the zinc palette wins without
exception; reconciling the two is a conversation that happens outside this codebase.

Reference: `.agents/docs/guidelines.md` §1, §2
