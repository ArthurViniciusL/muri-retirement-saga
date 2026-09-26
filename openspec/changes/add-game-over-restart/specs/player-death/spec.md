## Purpose

Defines what the guest sees and can do from the moment Muri loses his last heart, or
falls out of the world, until the game-over screen takes over, and what an attempt starts
over with. The game-over screen itself is the `game-over` capability.

## ADDED Requirements

### Requirement: Losing the last heart ends the run
Losing a heart while only one heart is left SHALL end the run. In order, the game SHALL
show the same camera shake any heart loss already shows, freeze the phase, and then, after
a death beat taken from game configuration, show the game-over screen for the phase being
played. The beat SHALL be 800 ms.

#### Scenario: Last heart lost
- **WHEN** Muri touches a hazard with one heart left
- **THEN** the hearts display shows zero hearts
- **AND** the camera shakes exactly as it does for any other heart loss
- **AND** the phase freezes
- **AND** the game-over screen appears 800 ms later

#### Scenario: Heart lost with hearts to spare
- **WHEN** Muri touches a hazard with more than one heart left
- **THEN** he loses one heart and the phase keeps running
- **AND** no death beat and no game-over screen happen

#### Scenario: Game over belongs to the phase being played
- **WHEN** the guest reaches zero hearts while playing a phase
- **THEN** the game-over screen offers that same phase, not another one

### Requirement: The phase freezes during the death beat
While the death beat runs, the phase SHALL be frozen: Muri, the scenery and every moving
element SHALL hold the exact position they had when the last heart was lost, including a
Muri who was in mid-air, who SHALL NOT finish his fall. The HUD SHALL stay visible,
showing zero hearts and the coins collected so far.

#### Scenario: Dying in mid-air
- **WHEN** Muri loses his last heart while jumping or falling
- **THEN** he stops in mid-air for the beat and does not land
- **AND** the game-over screen appears when the beat ends

#### Scenario: HUD during the beat
- **WHEN** the phase is frozen for the death beat
- **THEN** the hearts display is visible and empty
- **AND** the coin count is the one the guest reached

### Requirement: No extra emphasis at death
Death SHALL NOT add any visual effect of its own: no flash, no tint, no stronger or
longer shake, no zoom and no death animation. The freeze and the existing damage shake are
the whole presentation. When the guest's device prefers reduced motion, the shake SHALL be
omitted exactly as it already is for a heart loss, and the freeze and the beat SHALL still
happen.

#### Scenario: Reduced motion on
- **WHEN** the device prefers reduced motion and Muri loses his last heart
- **THEN** the camera does not shake
- **AND** the phase still freezes and the game-over screen still appears after the beat

### Requirement: Input is ignored from the last heart on
From the moment the last heart is lost until the game-over screen is shown, the phase
SHALL ignore every input: the virtual controls, the keyboard and any tap on the phase
SHALL do nothing, and the pause control SHALL NOT open the pause screen.

#### Scenario: Guest keeps pressing the controls
- **WHEN** the guest holds a direction or presses jump during the death beat
- **THEN** Muri does not move and nothing else in the phase reacts

#### Scenario: Guest tries to pause during the beat
- **WHEN** the guest presses pause during the death beat
- **THEN** the pause screen does not open and the game-over screen still appears on time

### Requirement: Death is final for the attempt
Once Muri is dead, the attempt SHALL NOT be able to leave that condition by any means: no
heart pickup, hazard, coin, dialogue or input SHALL bring him back, and a second death
SHALL NOT happen or restart the beat. The only way out is the game-over screen.

#### Scenario: A second hazard touches a dead Muri
- **WHEN** a hazard overlaps Muri during the death beat
- **THEN** nothing happens: no further heart loss, no extra shake, no second beat

### Requirement: Falling out of the world is a death without a beat
Falling below the bottom of the phase's world SHALL end the run the same way as losing the
last heart, except that it SHALL show the game-over screen immediately, with no death beat
and no shake, because Muri is already off-screen. It SHALL NOT silently reload the phase.

#### Scenario: Muri falls into a gap
- **WHEN** Muri falls past the bottom of the world
- **THEN** the game-over screen for that phase appears at once
- **AND** the phase does not simply start over on its own

#### Scenario: Falling with hearts left
- **WHEN** Muri falls past the bottom of the world with hearts to spare
- **THEN** the run still ends, and the remaining hearts change nothing

### Requirement: An attempt starts the phase over from its beginning
Restarting after a game over SHALL put the guest at the start of the same phase in the
state a first attempt has: Muri at the phase's starting point with five hearts, the common
coin count at zero, every coin back on the route, and the phase's puzzle still to be
solved. Nothing from the failed attempt SHALL carry over.

#### Scenario: Guest restarts after collecting coins
- **WHEN** the guest dies having collected coins and restarts the phase
- **THEN** the coin count reads zero and those coins are back on the route

#### Scenario: Guest restarts after solving the puzzle
- **WHEN** the guest dies after solving the phase's puzzle and restarts the phase
- **THEN** the puzzle has to be solved again to finish the phase

#### Scenario: Hearts on a new attempt
- **WHEN** a new attempt at the phase begins
- **THEN** Muri has five hearts and starts from the beginning of the route
