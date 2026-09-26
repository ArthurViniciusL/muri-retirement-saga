export type PlayerState = 'Idle' | 'Walk' | 'Jump' | 'Crouch' | 'Dead';

const TRANSITIONS: Record<PlayerState, readonly PlayerState[]> = {
  Idle: ['Walk', 'Jump', 'Crouch', 'Dead'],
  Walk: ['Idle', 'Jump', 'Crouch', 'Dead'],
  Jump: ['Idle', 'Walk', 'Crouch', 'Dead'],
  Crouch: ['Idle', 'Walk', 'Jump', 'Dead'],
  // Terminal: only GameOverScene ends the attempt, so nothing leads out of Dead.
  Dead: [],
};

export class PlayerStateMachine {
  private state: PlayerState = 'Idle';
  private entering = true;

  public get current(): PlayerState {
    return this.state;
  }

  /**
   * Verdadeiro só no passo em que o estado acabou de mudar. É o que separa entrar num
   * estado de seguir nele — quem toca animação na entrada depende disto para não
   * re-semear o loop a cada tick.
   */
  public get isEntering(): boolean {
    return this.entering;
  }

  public transition(next: PlayerState): boolean {
    if (next === this.state) {
      this.entering = false;
      return true;
    }
    if (!TRANSITIONS[this.state].includes(next)) {
      // Recusada: o estado não mudou, então este passo também não é uma entrada.
      this.entering = false;
      return false;
    }
    this.state = next;
    this.entering = true;
    return true;
  }
}
