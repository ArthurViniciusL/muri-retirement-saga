## Purpose

Defines how a playable phase is assembled from its configuration and map: world size,
solid ground, where the player starts, the parallax backdrop, how the camera follows and
what happens on a fall. Ported from the abandoned `phase1-movement-foundation` change,
with the game over path replaced by a debug restart and the placeholder tones replaced
by the Cordel Arcade palette.

## ADDED Requirements

### Requirement: Phase built from its configuration
Each phase SHALL take every phase-specific value (map, world height, player spawn,
scenery tiles, decoration seed, parallax tones, enemy spawns, thief encounters, ammo
pickups, puzzle theme, puzzle trigger zone and essential item) from its phase
configuration entry. The three phase screens SHALL share the same logic and differ only
by that entry. In this change, Phase 1 SHALL have empty enemy, thief and ammo lists.

#### Scenario: Phase 1 starts from the select screen
- **WHEN** the guest activates Phase 1 on the phase select screen
- **THEN** the Phase 1 map is shown with the player standing at the configured spawn point
- **AND** the menu music is not playing

#### Scenario: Tuning changes without scene changes
- **WHEN** the Phase 1 spawn point or world height is changed in the phase configuration
- **THEN** the phase uses the new value with no change to the phase screen's logic

### Requirement: World size and solid ground
The world SHALL be as wide as the phase map and as tall as the configured world height.
Tiles marked as solid in the map SHALL stop the player from every side. The left and
right edges of the world SHALL block the player. The top edge SHALL NOT block a jump.
The bottom edge SHALL NOT block a fall.

#### Scenario: Player lands on ground
- **WHEN** the player falls onto a solid tile
- **THEN** they stop on top of it and stand

#### Scenario: Long fall onto ground
- **WHEN** the player drops from the highest platform of the map onto the ground below
- **THEN** they land on the ground and do not pass through it
- **AND** their falling speed never exceeds the maximum fall speed from game configuration

#### Scenario: Player reaches the side of the world
- **WHEN** the player walks into the left or right edge of the world
- **THEN** they stop at the edge and do not leave the world

### Requirement: Phase 1 route draft
The Phase 1 map SHALL be a first draft of the real route: about 60 tiles of 64 px wide,
1152 px tall, built on the 64 px grid. It SHALL contain at least one vertical section
that takes the camera above the first screen, and one or two holes 2 tiles wide. It
SHALL NOT contain any obstacle that can only be passed while crouched. No hole SHALL
come right after a vertical section or a jump that needs the full jump height. Each hole
SHALL be visible before the player reaches its edge.

#### Scenario: Route is completable with movement only
- **WHEN** a player walks and jumps from the spawn point to the right end of the map
- **THEN** every obstacle on the route can be passed with the Phase 1 movement set

#### Scenario: Clear opening
- **WHEN** the guest starts the phase and walks forward through the first ten tiles
- **THEN** no obstacle is on the way and no heart can be lost there

#### Scenario: No forced crouch
- **WHEN** the player walks the whole route standing up
- **THEN** no ceiling blocks them

### Requirement: Parallax backdrop
Each phase SHALL show three depth layers behind and including the playable layer: a far
layer that scrolls at 0.25 of the camera, a middle layer at 0.5 and the playable layer
at 1.0, on both axes. The far layer SHALL be the sky tone of the phase configuration
plus clouds, the middle layer SHALL be generated hills in the phase's hill tones, and
the playable layer SHALL be the tile layer and its objects.

#### Scenario: Camera moves right
- **WHEN** the camera scrolls 400 px to the right
- **THEN** the far layer moves 100 px on screen, the middle layer 200 px and the playable
  layer 400 px

### Requirement: Camera follow
The camera SHALL follow the player on both axes, stay inside the world bounds, ignore
movement inside a deadzone of 30% of the view width by 40% of the view height, and
smooth its motion with the lerp factor from game configuration. Level content SHALL be
readable at the minimum logical width of 1024.

#### Scenario: Ordinary jump
- **WHEN** the player jumps in place on flat ground
- **THEN** the camera does not move vertically

#### Scenario: Climbing the vertical section
- **WHEN** the player climbs above the top of the first screen
- **THEN** the camera scrolls up and keeps them in view

### Requirement: Fall restarts the phase
While there is no game over screen, a fall below the bottom of the world SHALL restart
the phase at once, from the configured spawn point, with hearts and coins reset. This
replaces the final behaviour, where a fall ends the run.

#### Scenario: Player falls into a hole
- **WHEN** the player falls through a hole and passes the bottom edge of the world
- **THEN** the phase restarts with the player at the spawn point
- **AND** the coin counter and the heart counter are back at their starting values

### Requirement: Screen resize keeps the run
A change of screen size or orientation during a phase SHALL NOT restart the phase. The
player's position and state SHALL be kept, and screen-fixed controls SHALL move to their
anchored corners for the new size.

#### Scenario: Device rotates back to landscape
- **WHEN** the logical width changes from 1024 to 1300 while the player is mid-route
- **THEN** the player stays at the same world position
- **AND** the virtual controls stay in their corners
