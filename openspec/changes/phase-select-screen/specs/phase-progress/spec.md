## Purpose

Tracks which of the three phases the guest has completed during the current visit, and
decides from that which phases are unlocked and where the game goes after a phase ends.

## ADDED Requirements

### Requirement: Linear unlock rule
Phase 1 SHALL always be unlocked. Phase N (N > 1) SHALL be unlocked only when Phase
N - 1 is completed. A phase that is neither completed nor unlocked SHALL be locked.

#### Scenario: Nothing completed
- **WHEN** no phase is completed
- **THEN** Phase 1 is unlocked and Phases 2 and 3 are locked

#### Scenario: Phases 1 and 2 completed
- **WHEN** Phases 1 and 2 are completed
- **THEN** Phases 1 and 2 are completed and Phase 3 is unlocked

### Requirement: In-memory progress only
Phase progress SHALL exist only in memory for the lifetime of the page. It SHALL NOT be
written to `localStorage`, `sessionStorage`, cookies, IndexedDB or any network service.

#### Scenario: Page reload
- **WHEN** the guest has completed Phase 1 and reloads the page
- **THEN** no phase is completed and only Phase 1 is unlocked

#### Scenario: Scene restarts keep progress
- **WHEN** the guest has completed Phase 1 and rotates the device on the select screen,
  or goes back to the cover and returns
- **THEN** Phase 1 is still completed and Phase 2 is still unlocked

### Requirement: Completing a phase
When the guest completes a phase, the game SHALL mark it completed. If at least one
phase is still not completed, the game SHALL return to the select screen. If all three
phases are completed, the game SHALL go to the victory screen.

#### Scenario: Phase 1 completed
- **WHEN** the guest completes Phase 1 for the first time
- **THEN** the select screen is shown with Phase 1 completed and Phase 2 unlocked

#### Scenario: Last phase completed
- **WHEN** the guest completes Phase 3 and Phases 1 and 2 are already completed
- **THEN** the victory screen is shown

### Requirement: Replaying a completed phase
Replaying a completed phase SHALL NOT change progress. It SHALL NOT lock any phase and
SHALL NOT remove the completed mark, whatever the outcome of the replay.

#### Scenario: Replay Phase 1 after Phase 2 unlocked
- **WHEN** Phase 1 is completed and the guest replays and completes it again
- **THEN** the select screen shows Phase 1 completed and Phase 2 still unlocked

### Requirement: Game over keeps progress
Losing all hearts in a phase SHALL NOT change phase progress. The phase restarts from
its beginning, as already defined for game over.

#### Scenario: Game over in Phase 2
- **WHEN** Phase 1 is completed and the guest loses all hearts in Phase 2
- **THEN** Phase 1 stays completed and Phase 2 stays unlocked
