---
title: Three Parallax Layers, Depth by Tone
impact: MEDIUM
impactDescription: creates depth by tone and keeps the ground unambiguous
tags: ui, parallax, art
---

## Three Parallax Layers, Depth by Tone

Every phase has at least three depth layers, each with a fixed scroll factor and a fixed
tonal range. Since the camera also follows vertically, the same factor applies on both
axes.

| Layer | Scroll factor | Tones | Content |
| --- | --- | --- | --- |
| Far background | 0.25 | `bone` – `dust` | low-contrast silhouettes: stylised sun, hills, mandacaru |
| Middle | 0.5 | `dust` – `clay` | mid-distance scenery |
| Foreground / playable | 1.0 | `sertao` – `ink` | platforms and everything the player touches |

The tonal split is not decorative: it is the guarantee from
`art-contrast-readability.md` that ground is never mistaken for background decoration.

```ts
far.setScrollFactor(0.25);
mid.setScrollFactor(0.5);
// the playable layer keeps the default factor of 1
```

Reference: `.agents/docs/guidelines.md` §6, §9
