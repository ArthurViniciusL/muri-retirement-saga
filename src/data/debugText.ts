import type { PlayerState } from '@/systems/PlayerStateMachine';

const STATE_LABELS: Record<PlayerState, string> = {
  Idle: 'parado',
  Walk: 'andando',
  Jump: 'no ar',
  Crouch: 'agachado',
  Dead: 'morto',
};

export const debugText = {
  line: (state: PlayerState): string => STATE_LABELS[state],
} as const;
