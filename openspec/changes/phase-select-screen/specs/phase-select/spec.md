## Purpose

Lets the guest see their progress through the three phases and choose which phase to
play, between the cover screen and the phases themselves.

## ADDED Requirements

### Requirement: Select screen follows the cover
The game SHALL show the phase select screen when the guest presses "Iniciar" on the
cover, instead of starting Phase 1 directly. Pressing "Iniciar" SHALL still request
fullscreen and the landscape orientation lock.

#### Scenario: Guest presses Iniciar
- **WHEN** the guest presses "Iniciar" on the cover (by tap, Enter or Space)
- **THEN** the phase select screen is shown
- **AND** no phase has started

### Requirement: Screen content
The select screen SHALL show, centred and stacked from top to bottom: the title
"Selecione uma fase para jogar.", the description "Hora de iniciar a saga de
aposentadoria." and one icon per phase in a single row, ordered 1, 2, 3 from left to
right. All text SHALL use the game's bitmap pixel font and the zinc palette.

#### Scenario: Screen opens
- **WHEN** the select screen is shown
- **THEN** the title, the description and the three phase icons are visible
- **AND** the icons read 1, 2 and 3 from left to right

### Requirement: Phase icon states
Each phase icon SHALL display exactly one of three states, taken from phase progress:
- completed: the phase number and a carved check mark in a corner of the icon;
- unlocked: the phase number, with a continuous pulse;
- locked: a hatched paper face with a carved padlock and no phase number.

#### Scenario: First visit
- **WHEN** the guest opens the select screen and no phase is completed
- **THEN** Phase 1 is unlocked and pulses
- **AND** Phases 2 and 3 are locked

#### Scenario: After completing Phase 1
- **WHEN** the guest returns to the select screen after completing Phase 1
- **THEN** Phase 1 is completed, Phase 2 is unlocked and pulses, and Phase 3 is locked

### Requirement: Starting a phase
Activating a completed or unlocked phase icon SHALL start that phase.

#### Scenario: Guest taps an unlocked phase
- **WHEN** the guest taps the unlocked Phase 2 icon
- **THEN** Phase 2 starts

#### Scenario: Guest replays a completed phase
- **WHEN** the guest taps the completed Phase 1 icon
- **THEN** Phase 1 starts from its beginning

### Requirement: Locked phase feedback
Activating a locked phase icon SHALL NOT start the phase. The padlock SHALL shake
briefly, and a toast SHALL appear at the bottom centre of the screen with the text
"Conclua a fase {n} para desbloquear.", where {n} is the number of the phase just
before the one activated. The toast SHALL disappear by itself after 2.5 seconds. A new
toast SHALL replace a toast that is still visible instead of stacking below or above it.

#### Scenario: Guest taps locked Phase 3
- **WHEN** the guest taps the locked Phase 3 icon
- **THEN** Phase 3 does not start
- **AND** the Phase 3 padlock shakes
- **AND** a toast reading "Conclua a fase 2 para desbloquear." appears at the bottom centre

#### Scenario: Toast expires
- **WHEN** 2.5 seconds pass after a toast appears and no other locked icon is activated
- **THEN** the toast is gone

#### Scenario: Guest taps two locked phases quickly
- **WHEN** a toast is visible and the guest activates another locked icon
- **THEN** only one toast is visible, with the text for the latest icon, and its 2.5 s
  timer restarts

### Requirement: Keyboard navigation
The select screen SHALL support keyboard play. When the screen opens, focus SHALL be on
the unlocked phase; when all phases are completed, focus SHALL be on Phase 1. Left and
right arrow keys SHALL move focus to the previous and next icon, stopping at the ends,
and focus SHALL be able to reach locked icons. Enter and Space SHALL activate the
focused icon, with the same result as tapping it. The focused icon SHALL be visibly
marked.

#### Scenario: Guest confirms with the keyboard
- **WHEN** the screen opens on a first visit and the guest presses Enter
- **THEN** Phase 1 starts

#### Scenario: Guest focuses a locked phase
- **WHEN** the guest presses the right arrow and then Space on a first visit
- **THEN** Phase 2 does not start and the locked phase feedback is shown

### Requirement: Back to the cover
The select screen SHALL have a "Voltar" button in the top-left corner, styled as the
Sera `outline` button variant (dark border, paper background, dark label). Pressing it,
Esc or Backspace SHALL return to the cover. The cover SHALL then appear ready, without
replaying its stamp intro.

#### Scenario: Guest presses Voltar
- **WHEN** the guest presses "Voltar" or Esc on the select screen
- **THEN** the cover is shown in its final state, with no stamp intro

### Requirement: Music continuity
The `start_menu` track SHALL keep playing, without restarting, while the guest moves
between the cover and the select screen. It SHALL stop when a phase starts, and it SHALL
start again from the beginning when the game returns to the select screen after a phase.

#### Scenario: Cover to select and back
- **WHEN** the track is playing and the guest goes from the cover to the select screen
  and back
- **THEN** the track keeps playing from where it was, without restarting

#### Scenario: Phase starts
- **WHEN** the guest starts any phase from the select screen
- **THEN** the `start_menu` track stops

#### Scenario: Return from a phase
- **WHEN** the guest completes a phase and the select screen is shown again
- **THEN** the `start_menu` track starts again from the beginning

### Requirement: Click sound
The game SHALL play the UI click sound when the guest presses "Iniciar" on the cover and
each time the guest activates a phase icon on the select screen, whether the phase is
completed, unlocked or locked, and whether the activation comes from a tap, Enter or
Space. It SHALL also play when the guest leaves the select screen through "Voltar", Esc
or Backspace. The click SHALL keep playing when the screen changes right after the press.

#### Scenario: Guest presses Iniciar
- **WHEN** the guest presses "Iniciar"
- **THEN** the click sound plays once and the select screen opens

#### Scenario: Guest taps a locked phase
- **WHEN** the guest taps a locked phase icon
- **THEN** the click sound plays together with the padlock shake and the toast

#### Scenario: Guest presses Voltar
- **WHEN** the guest presses "Voltar", Esc or Backspace on the select screen
- **THEN** the click sound plays once and the cover is shown

### Requirement: Motion and resize
With "reduce motion" enabled, the select screen SHALL open in its final state, the
unlocked icon SHALL NOT pulse and the padlock SHALL NOT shake; the toast SHALL still
appear, without sliding. When the viewport size changes, the screen SHALL lay itself
out again for the new size, keeping phase progress unchanged.

#### Scenario: Reduced motion on
- **WHEN** the device prefers reduced motion and the guest taps a locked icon
- **THEN** the toast appears without animation and the padlock does not shake

#### Scenario: Device rotates
- **WHEN** the viewport size changes while the select screen is shown
- **THEN** the title, description, icons and "Voltar" are laid out again for the new size
- **AND** each icon keeps its state
