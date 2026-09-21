import type { PhaseNumber } from '@/systems/PhaseProgress';

export const phaseSelectText = {
  title: 'Selecione uma fase para jogar.',
  description: 'Hora de iniciar a saga de aposentadoria.',
  backLabel: 'Voltar',
  lockedToast: (previousPhase: PhaseNumber): string => `Conclua a fase ${previousPhase} para desbloquear.`,
} as const;
