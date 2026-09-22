---
title: Virtual Controls
impact: HIGH
impactDescription: the only input the game has; a missed tap is a lost life
tags: ui, input, mobile
---

## Virtual Controls

Touch is the input of the game as played at the party. `InputController.ts` abstracts
it, and no scene reads raw pointer events.

The keyboard is the desktop input, always available, never a substitute for the virtual
controls: `A`/`D` or the arrow keys move, `S` or the down arrow crouches, `W`, the up
arrow or the space bar jumps. Both sources are merged inside `InputController`, so a
scene sees intents and never asks which device produced them. Every screen still has to
be fully playable by touch alone.

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
