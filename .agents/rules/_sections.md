# Sections

This file defines all sections, their ordering, impact levels, and descriptions.
The section ID (in parentheses) is the filename prefix used to group rules.

All rules in this directory are written in English, even though the two source
documents (`.agents/docs/system-design.md`, `.agents/docs/guidelines.md`) are written in
Portuguese and in-game content stays in Portuguese.

---

## 1. Architecture (architecture)

**Impact:** HIGH
**Description:** Source of truth and precedence, scene structure, the client-only
nature of the build, and the repository workflow. These rules constrain every other
section.

## 2. Code (code)

**Impact:** HIGH
**Description:** TypeScript conventions, the data-driven phase configuration,
and the central game configuration where all tuning values live.

## 3. Gameplay (gameplay)

**Impact:** HIGH
**Description:** Player state machine, combat, health, enemies, thieves, the
memory puzzle, and camera behaviour.

## 4. Art (art)

**Impact:** HIGH
**Description:** The pseudo pixel art contract, the zinc palette, linework,
the locked 64 px grid, contrast rules, and asset naming.

## 5. UI (ui)

**Impact:** MEDIUM
**Description:** HUD layout, virtual controls, orientation and fullscreen,
and parallax layering.

## 6. Audio (audio)

**Impact:** LOW
**Description:** Musical style, the minimum SFX set, file formats, and the
two-wave loading strategy.

## 7. Content (content)

**Impact:** MEDIUM
**Description:** Level design progression, dialogue data, and the decisions
that are still deliberately open.
