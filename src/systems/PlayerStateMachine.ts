export type PlayerState = 'Idle' | 'Walk' | 'Jump' | 'Crouch' | 'Dead';

const TRANSITIONS: Record<PlayerState, readonly PlayerState[]> = {
  Idle: ['Walk', 'Jump', 'Crouch', 'Dead'],
  Walk: ['Idle', 'Jump', 'Crouch', 'Dead'],
  Jump: ['Idle', 'Walk', 'Crouch', 'Dead'],
  Crouch: ['Idle', 'Walk', 'Jump', 'Dead'],
  Dead: [],
};

export class PlayerStateMachine {
  private state: PlayerState = 'Idle';

  public get current(): PlayerState {
    return this.state;
  }

  public canTransition(next: PlayerState): boolean {
    return next === this.state || TRANSITIONS[this.state].includes(next);
  }

  public transition(next: PlayerState): boolean {
    if (!this.canTransition(next)) {
      return false;
    }
    this.state = next;
    return true;
  }
}
