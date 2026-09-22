/**
 * Bat — morcego (inimigo ambiental aéreo).
 *
 * Responsabilidade: movimento de voo em altura variável. Derrotado com 1 golpe
 * (corpo a corpo ou à distância), sem pontos de vida próprios; causa 1 coração de
 * dano por contato.
 *
 * Referência: System Design §8 (Inimigos ambientais); Guia de Estilo §5 (Inimigos).
 */
import Phaser from 'phaser';
import { gameConfig } from '@/config/gameConfig';
import type { EnemySpawn } from '@/config/phasesConfig';
import { enemyAnimationKeys } from '@/systems/EnemyAnimations';

const { bat } = gameConfig.enemies;
const FIRST_FRAME = `${enemyAnimationKeys.batFly}_01`;

// Patrulha horizontal em torno do spawn e mergulho entre o alto e a altura da cabeça
// do Muri: agachar desvia do ponto mais baixo. `spawn.y` é a linha do chão.
export class Bat extends Phaser.Physics.Arcade.Sprite {
  private readonly home: EnemySpawn;
  private readonly patrolOffset = Phaser.Math.FloatBetween(0, Math.PI * 2);
  private readonly swoopOffset = Phaser.Math.FloatBetween(0, Math.PI * 2);

  public constructor(scene: Phaser.Scene, spawn: EnemySpawn) {
    super(scene, spawn.x, spawn.y - bat.highAltitude, FIRST_FRAME);
    this.home = spawn;
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.setScale(bat.scale);
    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setAllowGravity(false);
    body.setSize(this.width * bat.hitbox.widthRatio, this.height * bat.hitbox.heightRatio, true);
    if (scene.anims.exists(enemyAnimationKeys.batFly)) {
      this.play(enemyAnimationKeys.batFly);
    }
  }

  protected override preUpdate(time: number, delta: number): void {
    super.preUpdate(time, delta);
    const patrol = (time / bat.patrolMs) * Math.PI * 2 + this.patrolOffset;
    const swoop = (1 - Math.cos((time / bat.swoopMs) * Math.PI * 2 + this.swoopOffset)) / 2;
    this.setPosition(
      this.home.x + (bat.patrolWidth / 2) * Math.sin(patrol),
      this.home.y - Phaser.Math.Linear(bat.highAltitude, bat.lowAltitude, swoop),
    );
    this.setFlipX(Math.cos(patrol) < 0);
  }
}
