## Purpose

Defines what fills a phase besides the ground: obstacles that hurt, obstacles that
block, decoration, and the common coins the player collects.

## ADDED Requirements

### Requirement: Scenery artwork is framed to the grid
Every scenery image SHALL be drawn at a size taken from configuration, and every such
size SHALL be a multiple of 64 on at least one side, with the artwork contained inside a
box whose sides are multiples of 64. No scenery image SHALL be drawn at its file size.

#### Scenario: A source image is replaced by a redrawn one
- **WHEN** an asset file is redrawn at a different resolution
- **THEN** it still appears at the same size in the phase, with no change to the scenes

### Requirement: Obstacles that hurt
`cactus_red` and `campfire` SHALL be solid: the player SHALL stop against them
and SHALL be able to stand on top of them. Touching one SHALL also cost one heart, once
per contact, respecting the damage cooldown from game configuration. Staying against one
SHALL NOT cost a second heart. No obstacle SHALL be taller than 96 px, so that
the player stays above it long enough to pass even with imperfect timing.

#### Scenario: Walking into a campfire
- **WHEN** the player walks into a campfire
- **THEN** they lose one heart and stop against it

#### Scenario: Staying against a campfire
- **WHEN** the player keeps pushing against the same campfire
- **THEN** no further heart is lost

#### Scenario: Feedback on damage
- **WHEN** the player loses a heart
- **THEN** the camera shakes lightly for a moment
- **AND** nothing shakes when the device asks for reduced motion

#### Scenario: Jumping over a campfire
- **WHEN** the player jumps from flat ground at the right moment
- **THEN** they clear the campfire without losing a heart

### Requirement: Obstacles that block
`cactus`, `rock_formation`, `stone_rock`, `wooden_barrel`, `woodlog`, `pebble` and
`fox_car` SHALL be solid and immovable: the player SHALL stop against them, SHALL be able to stand on top of them and
SHALL lose no heart from touching them.

#### Scenario: Walking into a rock
- **WHEN** the player walks into a rock formation
- **THEN** they stop against it with all hearts intact

### Requirement: Decoration never interferes
`foliage` and `fluffy_cloud` SHALL have no collision and no damage, and SHALL be drawn
behind the player. Ground decoration SHALL be visibly shorter than the shortest obstacle,
so nothing harmless looks like something to jump. Ground decoration SHALL appear only in
groups of three around the obstacle named by the phase configuration, never alone and
never spread along open ground. Their placement SHALL come from a per-phase seed in the
phase configuration, so the same phase looks the same on every run and on every device.

#### Scenario: Bushes around a cactus
- **WHEN** the player reaches a cactus
- **THEN** three bushes stand around it, some on each side
- **AND** no bush stands anywhere else on the route

#### Scenario: Two runs of the same phase
- **WHEN** the phase restarts or is played again
- **THEN** the decoration is in the same places as before

#### Scenario: Decoration on the route
- **WHEN** the player walks through foliage
- **THEN** nothing stops them and no heart is lost
- **AND** the foliage is shorter than any obstacle on the route

### Requirement: Coins spin
A coin SHALL spin in a continuous loop, with no pause and no jump between poses: its
width SHALL follow the rotation, and the side pose SHALL be shown only while the coin is
nearly edge-on. Every coin of a phase SHALL spin in step. The spin SHALL NOT change the
coin's height or the area that collects it.

#### Scenario: A coin turns edge-on
- **WHEN** a coin reaches the narrow point of its turn
- **THEN** the side artwork is shown and the coin grows back to its full width without a
  visible cut

### Requirement: Common coins are collected
Common coins SHALL come from the `coins` object layer of the phase map. Touching one
SHALL remove it and raise the coin count by one. A coin SHALL NOT be collectable twice
and SHALL cost no heart.

#### Scenario: Touching a coin
- **WHEN** the player touches a coin
- **THEN** the coin disappears and the coin count goes up by one

#### Scenario: Walking back over a collected coin
- **WHEN** the player walks back over the place where a coin was collected
- **THEN** the count does not change

### Requirement: Hearts on screen
The phase SHALL show the hearts as icons fixed at the top-left corner, one per heart of
the maximum in game configuration, outside the debug layer. A heart that is lost SHALL
show the half frame briefly and pulse once before settling on the empty frame. In this
milestone reaching zero SHALL NOT end the run.

#### Scenario: Losing a heart
- **WHEN** the player loses a heart
- **THEN** the rightmost full heart flashes its half frame, pulses and becomes empty

#### Scenario: Losing the last heart
- **WHEN** the player loses their fifth heart
- **THEN** every heart is empty and the phase keeps running

### Requirement: Coin counter on screen
The phase SHALL show the coins as `[icon] [total]` fixed under the hearts, outside the
debug layer, starting at zero. Collecting a coin SHALL raise the total and pulse the
icon once.

#### Scenario: Collecting a coin
- **WHEN** the player touches a coin
- **THEN** the total goes up by one and the icon pulses

### Requirement: Debug state on screen
While the debug flag is on, the phase SHALL show the player's current state under the
counters. It SHALL NOT repeat the hearts or the coins.

#### Scenario: Debug flag off
- **WHEN** the debug flag is off
- **THEN** the state line is gone and the hearts and coins are still on screen
