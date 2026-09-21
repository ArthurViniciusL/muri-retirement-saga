---
title: Thief Dialogue Data
impact: MEDIUM
impactDescription: keeps the jokes, which are the point of the game, out of the code
tags: content, dialogue, data
---

## Thief Dialogue Data

Each thief has a fixed array of five lines, stored in `src/data/dialogueLines/`
(`maryana.ts`, `mayra.ts`, `weruska.ts`). The lines are in-game content written in
Brazilian Portuguese and are never translated, edited for grammar, or moved into a
scene. They are family in-jokes; the wording is the deliverable.

Behaviour:

- One line is drawn at random on each appearance, with a simple guard against repeating
  the same line twice in a row.
- `DialogueBubble` is anchored to the thief's on-screen position and renders above the
  scene **without pausing it**.
- The bubble stays visible for **20 seconds**.
- One reusable bubble frame is shared by all three thieves; only the text changes.

**Incorrect:**

```ts
this.add.text(x, y, 'Pai, manda meu PIX!');   // content hardcoded in a scene
this.scene.pause();                            // the bubble never pauses the game
```

**Correct:**

```ts
this.dialogue.show(mayraLines.pickNonRepeating(), thief);
```

Reference: `.agents/docs/system-design.md` §9, §10; `.agents/docs/guidelines.md` §5
