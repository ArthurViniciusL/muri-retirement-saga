## Purpose

Defines how the player moves in a phase: standing, walking, jumping and crouching, the
size of the body in each posture, and the jump assists that make touch control forgiving.
Ported from the abandoned `phase1-movement-foundation` change. In this milestone the
player is a debug rectangle, not Muri's sprite.

## ADDED Requirements

### Requirement: Movement states
The player SHALL be in exactly one movement state at a time: `Idle`, `Walk`, `Jump` or
`Crouch`. Only the player state machine SHALL change the state. `Idle` SHALL apply on the
ground with no horizontal intent, `Walk` on the ground while moving, `Jump` while in the
air, and `Crouch` while the crouch intent is held on the ground or while a low ceiling
keeps the player down.

#### Scenario: Walking stops
- **WHEN** the player is walking and the horizontal intent is released
- **THEN** they stop moving horizontally and the state becomes `Idle`

#### Scenario: Walking off a ledge
- **WHEN** the player walks off the edge of a platform
- **THEN** the state becomes `Jump` while they fall

### Requirement: Debug placeholder appearance
While the debug flag is on, the player SHALL be drawn as a flat rectangle instead of a
sprite: green while idle, walking forward or in the air, blue while moving left, and red
while crouched. The rectangle SHALL be 64×96 standing and 64×64 crouched. These colours
are outside the Cordel Arcade palette on purpose and SHALL be removed with the flag when
Muri's art lands.

#### Scenario: Turning back
- **WHEN** the player moves left
- **THEN** the rectangle is blue

#### Scenario: Crouching
- **WHEN** the player crouches on the ground
- **THEN** the rectangle is red and 64 px tall

### Requirement: Facing
The player SHALL face the direction of their last horizontal movement. Art SHALL be
drawn facing right and mirrored in code when facing left.

#### Scenario: Turning left
- **WHEN** the player moves left after facing right
- **THEN** they are shown facing left

### Requirement: Body size
The collision body SHALL be 40×88 while standing and 40×56 while crouched, horizontally
centred, with the bottom of the body at the bottom of the drawing. The body sizes SHALL
come from game configuration.

#### Scenario: Crouching lowers only the top
- **WHEN** the player crouches on the ground
- **THEN** their feet stay at the same height
- **AND** the body becomes 56 px tall

### Requirement: Crouch
Crouching SHALL be available only on the ground and SHALL stop the player: while
crouched, no horizontal movement SHALL happen, whatever the direction intent says. The
posture SHALL end as soon as the crouch intent is released, and nothing in the level
SHALL ever force it.

#### Scenario: Crouch in the air
- **WHEN** the crouch intent is pressed while the player is in the air
- **THEN** the body does not shrink

#### Scenario: Walking into a crouch
- **WHEN** the player crouches while holding a direction
- **THEN** they stop where they are and stay there until the crouch is released

### Requirement: Single jump with variable height
A jump SHALL start only from the ground or within the coyote time. The player SHALL have
one jump until they land again; there is no double jump. Holding the jump intent SHALL
give the full height from game configuration, which SHALL clear an obstacle 96 px tall
with room to spare.
Releasing the jump intent while rising SHALL cut the rise short. A jump SHALL NOT start
while a low ceiling keeps the player crouched.

#### Scenario: Full jump
- **WHEN** the player jumps from flat ground and holds the jump intent to the top
- **THEN** they can land on a platform 128 px above the ground

#### Scenario: Short hop
- **WHEN** the jump intent is released shortly after the jump starts
- **THEN** the player reaches a lower height than a full jump

#### Scenario: No double jump
- **WHEN** the jump intent is pressed again while the player is in the air after a jump
- **THEN** no second jump happens

### Requirement: Coyote time and jump buffer
A jump pressed within the coyote time after the player walks off a ledge SHALL still
start a jump. A jump pressed within the jump buffer before landing SHALL start a jump on
landing. Both windows SHALL come from game configuration, with starting values of about
80 ms for coyote time and about 100 ms for the jump buffer.

#### Scenario: Late jump off a ledge
- **WHEN** the jump intent is pressed 50 ms after the player walks off a ledge
- **THEN** they jump

#### Scenario: Early jump before landing
- **WHEN** the jump intent is pressed 60 ms before the player lands
- **THEN** they jump as soon as they land

### Requirement: Keyboard on desktop, touch on the phone
The phase SHALL accept the virtual controls and the keyboard at the same time. The
keyboard SHALL be the desktop input: `A` and `D` or the arrow keys move, `S` or the down
arrow crouches, `W`, the up arrow or the space bar jumps.

#### Scenario: Keyboard and touch together
- **WHEN** the guest plays with the virtual controls after a key was pressed
- **THEN** the controls still move the player
