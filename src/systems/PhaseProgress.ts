export const PHASES = [1, 2, 3] as const;

export type PhaseNumber = (typeof PHASES)[number];
export type PhaseState = 'completed' | 'unlocked' | 'locked';
export type PhaseSceneKey = 'Phase1Scene' | 'Phase2Scene' | 'Phase3Scene';
export type AfterPhaseSceneKey = 'PhaseSelectScene' | 'VictoryScene';

const SCENE_KEYS: Record<PhaseNumber, PhaseSceneKey> = {
  1: 'Phase1Scene',
  2: 'Phase2Scene',
  3: 'Phase3Scene',
};

const completed = new Set<PhaseNumber>();

export class PhaseProgress {
  public static stateOf(phase: PhaseNumber): PhaseState {
    if (completed.has(phase)) {
      return 'completed';
    }
    const previous = PhaseProgress.previousOf(phase);
    return previous === undefined || completed.has(previous) ? 'unlocked' : 'locked';
  }

  public static previousOf(phase: PhaseNumber): PhaseNumber | undefined {
    return PHASES[PHASES.indexOf(phase) - 1];
  }

  public static complete(phase: PhaseNumber): AfterPhaseSceneKey {
    completed.add(phase);
    return completed.size === PHASES.length ? 'VictoryScene' : 'PhaseSelectScene';
  }

  public static focusTarget(): PhaseNumber {
    return PHASES.find((phase) => PhaseProgress.stateOf(phase) === 'unlocked') ?? 1;
  }

  public static sceneKeyOf(phase: PhaseNumber): PhaseSceneKey {
    return SCENE_KEYS[phase];
  }
}

declare global {
  interface Window {
    // Só em desenvolvimento: conferir os estados antes de uma fase poder ser concluída.
    __phaseProgress?: typeof PhaseProgress;
  }
}

if (import.meta.env.DEV) {
  window.__phaseProgress = PhaseProgress;
}
