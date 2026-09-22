---
title: Asset File Naming
impact: LOW
impactDescription: keeps sprite atlas integration mechanical
tags: art, assets, naming
---

## Asset File Naming

Sprite files follow `<entity>_<action>_<frame>.png`, lower case, frame padded to two
digits. Entity and action names stay in the vocabulary already used by the design
documents.

```
muri_idle_01.png
muri_walk_03.png
bat_fly_02.png
maryana_idle.png
puzzle_card_instrumento_violao.png
ui_heart_full.png
ui_heart_empty.png
```

A scenery prop with a single frame drops the action and the frame number and is named
`<entity>.png`: `cactus.png`, `rock_formation.png`, `foliage.png`, `brick_wall.png`. A
prop with frames keeps the full form, as in `coin_spin_01.png`.

Upscale suffixes (`_8x`, `_24x`), capital letters and doubled extensions
(`name.png.png`) never ship. Rename a third-party file on the way in; the file's own
resolution is recorded in `.agents/docs/scenery-assets.md`, not in its name.

Files live under `src/assets/sprites/`, tilemaps under `src/assets/tilemaps/`, audio
under `src/assets/audio/`, following the folder structure in the system design.

Characters are drawn **facing right** only and mirrored in code for the left direction.
Do not ship mirrored duplicates.

Reference: `.agents/docs/guidelines.md` §5, §10; `.agents/docs/system-design.md` §4
