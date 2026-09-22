---
title: Virtual Controls
impact: HIGH
impactDescription: the only input the game has; a missed tap is a lost life
tags: ui, input, mobile
---

## Virtual Controls

Touch is the primary input. The keyboard is a secondary source for desktop play and
development. `InputController.ts` merges both into the same intents, and no scene reads
raw pointer or key events during a phase.

Keyboard mapping during a phase: `A`/`D` move, `S` crouches, `W` and `Space` jump, `J`
melee, `K` ranged, `L` defend (held), `Esc` and `P` pause. Arrow keys do not control
Muri.

The virtual controls are visible at the start of a phase on touch devices. The first
key press hides them and releases every held touch intent; the next touch shows them
again. The pause button is not part of the virtual controls and is always visible.

- **D-pad** bottom left: left, right, down (crouch). There is no up — jump is a button.
- **Action buttons** bottom right: jump, melee attack, ranged attack, defend.
- Buttons are 128 logical px, a clean multiple of the 64 grid.
- **The touch hitbox is always equal to or larger than the button sprite**, never
  smaller. A visually tidy button with a tight hitbox is the classic way a virtual control
  fails on a small screen.
- Two states per button, normal and pressed, both authored as art.
- Defend is held, not toggled, and the player keeps moving while it is held.

**Incorrect:**

```ts
const btn = this.add.image(x, y, 'ui_btn_jump').setInteractive();  // hitbox = sprite
```

**Correct:**

```ts
const btn = this.add.image(x, y, 'ui_btn_jump');
btn.setInteractive(new Phaser.Geom.Circle(64, 64, 96), Phaser.Geom.Circle.Contains);
```

Reference: `.agents/docs/system-design.md` §14; `.agents/docs/guidelines.md` §7
