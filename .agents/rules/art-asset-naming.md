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

Files live under `src/assets/sprites/`, tilemaps under `src/assets/tilemaps/`, audio
under `src/assets/audio/`, following the folder structure in the system design.

Exception: Muri's frames are the owner's drawings, stored as
`src/assets/sprites/muri/<folder>/NNN.png` or `.jpg` (`walk/002.png`, `stoped/001.png`,
`crouch/001.jpg`); the code derives the keys `muri_<action>_NNN`. A JPEG's white
background is removed at load time, so no conversion step is needed.

Characters are drawn **facing right** only and mirrored in code for the left direction.
Do not ship mirrored duplicates.

Reference: `.agents/docs/guidelines.md` §5, §10; `.agents/docs/system-design.md` §4
