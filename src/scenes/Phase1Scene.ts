import { phasesConfig } from '@/config/phasesConfig';
import { PhaseScene } from '@/scenes/PhaseScene';

export class Phase1Scene extends PhaseScene {
  public constructor() {
    super('Phase1Scene', phasesConfig.phase1);
  }
}
