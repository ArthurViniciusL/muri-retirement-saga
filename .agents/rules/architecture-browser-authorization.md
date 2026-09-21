---
title: The Test Browser Requires Explicit Authorization
impact: HIGH
impactDescription: nothing plays sound, grabs focus or runs the game without the owner saying so
tags: architecture, process, browser, testing
---

## The Test Browser Requires Explicit Authorization

No agent opens or drives a test browser without the project owner's explicit
authorization, given for that session of testing. That covers the browser pane built
into the agent's app, the owner's own Chrome through an extension, headless browsers
such as Playwright or Puppeteer, and a dev server started only so that a browser can
load it.

The reason is concrete. The game plays music and asks for fullscreen. When a browser
test clicked the start screen, the click unlocked the audio, and the menu track went on
looping in a hidden browser pane while the owner was working on something else.

Requires authorization, every time:

- Opening a browser tab or preview pane on the game, the dev server or the built output.
- Clicking, typing, resizing or taking screenshots in that browser.
- Starting `yarn dev` or `yarn preview` for the purpose of loading it in a browser.

Does not require authorization:

- `yarn build`, `yarn lint` and `tsc --noEmit`. They run in the terminal and never open
  a page.
- Reading and editing source files.

Authorization is per testing session, not permanent. Approval to check one change does
not cover the next change. When a browser session ends, close the tab or pane so nothing
keeps running in the background.

When a change can only be verified in a browser and there is no authorization, finish
the change, run the terminal checks, say that the visual check has not been done, and
ask whether to run it.

**Incorrect:** finishing the start screen, opening the preview pane on its own initiative
to "confirm it renders", clicking the button, and leaving the tab open.

**Correct:** "Build, types and lint pass. I haven't looked at it in the browser. Want me
to open the preview and check the animation?"

Reference: standing instruction from the project owner
