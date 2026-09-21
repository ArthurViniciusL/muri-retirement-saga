---
title: Chiptune Audio, Dual Format, Two Loading Waves
impact: LOW
impactDescription: keeps the first play fast on party wifi and audible on iOS
tags: audio, loading, mobile
---

## Chiptune Audio, Dual Format, Two Loading Waves

Music and effects are **chiptune-nordestino**: 8-bit accordion and forró references.

Minimum SFX set: jump, coin, damage (heart lost), melee attack, ranged attack, puzzle
match, puzzle miss, phase victory, final victory.

**Formats.** Ship every clip as `.ogg` and `.m4a` in the same `load.audio()` call.
Chrome plays the ogg, iOS Safari plays the m4a, and Phaser picks whichever the device
supports.

```ts
this.load.audio('sfx_jump', ['audio/sfx_jump.ogg', 'audio/sfx_jump.m4a']);
```

**Two waves.** `PreloadScene` loads the SFX set plus the Phase 1 track only. The Phase 2
and Phase 3 tracks load in the background while the guest is already playing. Loading
all three tracks up front delays the first play on a crowded party network, which is the
moment the guest is most likely to give up.

Reference: `.agents/docs/system-design.md` §15
