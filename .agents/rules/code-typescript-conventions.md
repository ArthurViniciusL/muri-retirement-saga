---
title: TypeScript Conventions
impact: HIGH
impactDescription: keeps the codebase reviewable and free of hidden tuning values
tags: code, typescript, conventions
---

## TypeScript Conventions

`tsconfig.json` runs with `strict: true` and `yarn build` type-checks before bundling.
On top of that, six conventions are enforced in review:

1. **No `any`, and no `as` outside a type guard.** Phaser's types are complete enough;
   an assertion is a signal that the wrong object is being passed around.
2. **Named exports only.** No `export default`. Default exports let the same class be
   imported under different names, which breaks grep-based navigation.
3. **File name equals exported class name.** `Phase1Scene.ts` exports `Phase1Scene`,
   and the Phaser scene key is the same string.
4. **No gameplay number literals inside a scene or entity.** Speeds, gravity, damage,
   timers, spawn positions and counts come from `gameConfig.ts` or `phasesConfig.ts`.
5. **No user-facing text inside a scene or entity.** Dialogue and labels come from
   `src/data/`.
6. **Comments are the exception, not the norm.** Code explains itself through names and
   small functions. No file header blocks, and no comment that restates what a name or
   a line already says. A comment is kept only for a non-obvious *why* the code cannot
   express — a browser or platform quirk, or a deliberate deviation from a style token or
   rule — and stays one or two lines long.

**Incorrect:**

```ts
export default class Phase1 extends Phaser.Scene {
  create() {
    const bat = this.add.sprite(400, 120, 'bat') as any;
    bat.speed = 140;
    this.add.text(20, 20, 'Pai, me dâ um carmed!');
  }
}
```

**Correct:**

```ts
export class Phase1Scene extends Phaser.Scene {
  create() {
    const bat = new Bat(this, this.config.enemySpawns[0]);
    this.dialogue.show(maryanaLines.pick(), bat);
  }
}
```

Reference: `.agents/docs/system-design.md` §4; `eslint.config.js`
