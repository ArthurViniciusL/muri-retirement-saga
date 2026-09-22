import type Phaser from 'phaser';
import { gameConfig } from '@/config/gameConfig';
import type { PlayerState } from '@/systems/PlayerStateMachine';

// Fora da paleta Cordel de propósito: são placeholders de debug, cobertos pela
// exceção em .agents/rules/art-scenery-asset-exception.md.
const FORWARD = 0x2f9e44;
const BACK = 0x1c64c4;
const CROUCH = 0xc92a2a;
const OUTLINE = 0x101010;
const OUTLINE_WIDTH = 4;

export type DebugPose = 'forward' | 'back' | 'crouch';

export function debugPlayerTextureKey(pose: DebugPose): string {
  return `debug_player_${pose}`;
}

export function debugPoseFor(state: PlayerState, facingLeft: boolean): DebugPose {
  if (state === 'Crouch') {
    return 'crouch';
  }
  return facingLeft ? 'back' : 'forward';
}

export class DebugTextures {
  public static generate(scene: Phaser.Scene): void {
    if (!gameConfig.debug.enabled) {
      return;
    }
    const { standing, crouching } = gameConfig.player;
    DebugTextures.make(scene, 'forward', FORWARD, standing.displayWidth, standing.displayHeight);
    DebugTextures.make(scene, 'back', BACK, standing.displayWidth, standing.displayHeight);
    DebugTextures.make(scene, 'crouch', CROUCH, crouching.displayWidth, crouching.displayHeight);
  }

  private static make(scene: Phaser.Scene, pose: DebugPose, fill: number, width: number, height: number): void {
    const key = debugPlayerTextureKey(pose);
    if (scene.textures.exists(key)) {
      return;
    }
    const graphics = scene.make.graphics({}, false);
    graphics.fillStyle(OUTLINE, 1).fillRect(0, 0, width, height);
    graphics
      .fillStyle(fill, 1)
      .fillRect(OUTLINE_WIDTH, OUTLINE_WIDTH, width - OUTLINE_WIDTH * 2, height - OUTLINE_WIDTH * 2);
    graphics.generateTexture(key, width, height);
    graphics.destroy();
  }
}
