---
name: pixel-art-style-check
description: Checks whether an existing pixel art asset of "A Aposentadoria de Muri" follows the visual guide — Cordel Arcade palette only, at most 3–4 tones per sprite, mandatory ink outline, gouge marks within the ink budget, no gradient/glow/transparency, locked 64 px grid and correct file name. Use it to review or approve any sprite, tile, puzzle card, HUD icon or control button. To produce a new asset, use design-asset instead.
---

# pixel-art-style-check

Review an asset that already exists against `.agents/docs/guidelines.md` and the `art-*`
rules. Report; do not redraw.

## 1. Run the verifier

```bash
python3 .agents/skills/design-asset/scripts/verify_asset.py --role <role> <files...>
```

Roles: `player`, `enemy`, `thief`, `projectile`, `item`, `tile`, `hud`, `card`,
`button`, `background`. It checks size on the grid, palette membership, binary alpha,
tone count, the playable/decorative tone range, outline coverage and the file name. Any
`FAIL` blocks approval.

## 2. Check by eye what the script cannot

- **Silhouette**: filled solid, is it recognisable and distinct from its neighbours
  (Muri, the three enemies, the three thieves)?
- **Gouge marks** (`guidelines.md` §15): leaf-shaped, scattered, varied in density,
  some lying across the mass; under 10% of the dark area cut away. A mass that reads as
  a lighter tone has too many marks.
- **Hatching** (§16): one angle, 45° (crossed at 135°), spacing of at least 2 px, only
  on bare paper.
- **Same hand**: beside the existing sprites and the invitation's pieces in the sibling
  `digital-invite` project, does it look like the same carver?
- **Frame set**: complete per `references/asset-catalog.md` of the `design-asset` skill.

## 3. Report

One line per asset: `PASS` or `FAIL`, then each defect with the rule or guide section it
breaks. Warnings that do not block approval go last.
