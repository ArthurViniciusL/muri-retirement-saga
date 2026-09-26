## Purpose

Tells the guest the run is over and gives them the one way back into play: restarting,
from the beginning, the phase they died in.

## ADDED Requirements

### Requirement: Game over screen replaces the phase
The game SHALL show the game over screen as a full screen of its own, in place of the
phase, once the death is resolved. It SHALL NOT be an overlay, a pause panel or a
darkened snapshot of the phase: the background SHALL be a solid dark field covering the
whole viewport, with no scenery, no HUD, no virtual controls and no trace of the phase
behind it.

#### Scenario: Screen opens after the last heart
- **WHEN** the death of the fifth heart is resolved and the game over screen is shown
- **THEN** the screen is a solid dark field
- **AND** no scenery, HUD or virtual control from the phase is visible

#### Scenario: Screen opens after a fall
- **WHEN** Muri falls below the world and the game over screen is shown
- **THEN** the same solid dark screen is shown, with the same content

### Requirement: Screen content
The game over screen SHALL show, centred on the screen and stacked from top to bottom:
the title "Acabaram os corações", the support line "A fase começa de novo, Muri." and a
single button labelled "Tentar de novo". All text SHALL use the game's bitmap pixel font
and the Cordel Arcade palette, light on the dark field. The screen SHALL show no other
text and no other control.

#### Scenario: Screen opens
- **WHEN** the game over screen is shown
- **THEN** the title, the support line and the "Tentar de novo" button are visible,
  stacked in that order and centred
- **AND** nothing else on the screen can be pressed

### Requirement: Restarting the phase
Activating "Tentar de novo" SHALL start, from its beginning, the same phase the guest
died in. The screen SHALL carry that phase from the moment it opens, so the button
always restarts the phase that was being played and never another one.

#### Scenario: Guest dies in Phase 2
- **WHEN** the guest dies in Phase 2 and presses "Tentar de novo"
- **THEN** Phase 2 starts from its beginning

#### Scenario: Guest dies in Phase 3
- **WHEN** the guest dies in Phase 3 and presses "Tentar de novo"
- **THEN** Phase 3 starts from its beginning

#### Scenario: Guest presses twice
- **WHEN** the guest presses "Tentar de novo" twice in quick succession
- **THEN** the phase starts once

### Requirement: No exit other than restarting
The game over screen SHALL offer exactly one action. There SHALL be no second button, no
way to reach the phase select screen or the cover from this screen, and no key that
leaves it other than the keys that activate "Tentar de novo".

#### Scenario: Guest looks for a way out
- **WHEN** the game over screen is shown and the guest presses Esc or Backspace
- **THEN** the screen stays as it is and no other screen opens

### Requirement: Keyboard activation
Enter and Space SHALL activate "Tentar de novo", with the same result as tapping it.

#### Scenario: Guest presses Enter
- **WHEN** the game over screen is shown and the guest presses Enter
- **THEN** the phase the guest died in starts from its beginning

#### Scenario: Guest presses Space
- **WHEN** the game over screen is shown and the guest presses Space
- **THEN** the phase the guest died in starts from its beginning

### Requirement: Opening animation
The game over screen SHALL open with the same stamp intro the cover and the phase select
screen use: the title, the support line and the button appear one after the other, each
stamped down onto the field, followed by a short camera shake. Once the intro ends, the
button SHALL pulse continuously until it is pressed. The button SHALL be pressable during
the intro.

#### Scenario: Screen opens
- **WHEN** the game over screen is shown
- **THEN** the title, the support line and the button are stamped in that order
- **AND** the button pulses once the last one has landed

#### Scenario: Guest presses during the intro
- **WHEN** the guest taps where the button is before the intro ends
- **THEN** the phase the guest died in starts from its beginning

### Requirement: Reduced motion
With "reduce motion" enabled, the game over screen SHALL appear directly in its final
state: no stamp, no camera shake and no button pulse. Every element SHALL be visible and
pressable from the first frame.

#### Scenario: Reduced motion on
- **WHEN** the device prefers reduced motion and the game over screen is shown
- **THEN** the title, the support line and the button are visible immediately, without
  animation
- **AND** the button does not pulse

### Requirement: Resize keeps the screen and the phase
When the viewport size changes while the game over screen is shown, the screen SHALL lay
itself out again for the new size, and the phase that "Tentar de novo" restarts SHALL be
unchanged. The stamp intro SHALL NOT play again after a relayout.

#### Scenario: Device rotates
- **WHEN** the viewport size changes while the game over screen is shown
- **THEN** the title, the support line and the button are laid out again, centred for the
  new size
- **AND** the stamp intro does not play again

#### Scenario: Restart after a rotation
- **WHEN** the guest dies in Phase 1, the viewport size changes, and the guest then
  presses "Tentar de novo"
- **THEN** Phase 1 starts from its beginning

### Requirement: Sound on the screen
The game over screen SHALL play the UI click sound when the guest activates "Tentar de
novo", whether by tap, Enter or Space, and the click SHALL keep playing while the phase
starts. The screen SHALL play no other sound: no game over jingle, and no music starts
or resumes while it is shown.

#### Scenario: Guest presses Tentar de novo
- **WHEN** the guest activates "Tentar de novo"
- **THEN** the click sound plays once and the phase starts

#### Scenario: Screen is shown
- **WHEN** the game over screen is shown and the guest does not press anything
- **THEN** no music and no sound effect plays
