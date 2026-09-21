---
title: Source of Truth and Decision Precedence
impact: HIGH
impactDescription: prevents invented mechanics, values and names
tags: architecture, process, documentation
---

## Source of Truth and Decision Precedence

Nothing in this project may be invented. Every mechanic, name, number and visual
decision comes from a written source. When something is not covered, it becomes a
question to the project owner, never an assumption.

Precedence, highest first:

1. `.agents/rules/` — locked decisions, including decisions taken *after* the design
   documents were written.
2. `.agents/docs/system-design.md` and `.agents/docs/guidelines.md` — the original design documents.
3. Nothing else. If neither level answers the question, ask.

The rules directory wins on conflict **by design**. The design documents were
deliberately left untouched when later decisions superseded them, so a divergence
between a rule and a document is intentional, not an oversight.

**Correct document paths** (several files in this repository still cite paths that do
not exist):

| Use this | Not this |
| --- | --- |
| `.agents/docs/system-design.md` | `docs/SYSTEM-DESIGN-jogo-muricarliton.md` |
| `.agents/docs/guidelines.md` | `docs/GUIA-DE-ESTILO-jogo-muricarliton.md` |
| `.agents/docs/system-design.md` | `docs/system-design.md` (moved out of the repository root) |
| `.agents/docs/guidelines.md` | `docs/guidelines.md` (moved out of the repository root) |

### Locked decisions

Decisions taken after the design documents and binding from now on:

| Decision | Value | Supersedes |
| --- | --- | --- |
| Sprite grid | 64×64 px, locked | `guidelines.md` §4 ("32 or 64, lock it later") |
| Player sprite | 64×96 px | — |
| Scene scale mode | `Scale.RESIZE`, logical height fixed at 576 | — |
| Logical width | elastic, clamped to [1024, 1440] | — |
| Rendering | pseudo pixel art: strict authoring, fractional display scale allowed | — |
| Camera | follows both axes, deadzone 30%×40%, lerp 0.12 | — |
| Thief encounters | placed in the tilemap, not random over time | `system-design.md` §9 |
| Audio formats | `.ogg` + `.m4a` fallback, two-wave loading | — |
| Coin placement | Tiled object layer named `coins` | — |

**Incorrect:**

```ts
// "The document does not say how fast a bat flies, so 150 looks fine."
this.setVelocityX(150);
```

**Correct:**

```ts
// Tuning values live in configuration and are filled in by the level designer.
this.setVelocityX(gameConfig.enemies.bat.speed);
```

Reference: `.agents/docs/system-design.md` §18; `README.md` ("o que não estiver coberto vira uma pergunta, não uma suposição")
