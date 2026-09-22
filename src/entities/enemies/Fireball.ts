/**
 * Fireball — bola de fogo (inimigo ambiental de altura intermediária).
 *
 * Responsabilidade: trajetória pelo meio da tela, entre o chão e o voo alto.
 * Derrotada com 1 golpe, sem pontos de vida próprios; causa 1 coração de dano por
 * contato, respeitando o cooldown técnico de ~400ms de dano.
 *
 * Referência: System Design §8 (Inimigos ambientais), §5 (cooldown técnico de dano).
 */
import Phaser from 'phaser';
import { gameConfig } from '@/config/gameConfig';
import type { EnemySpawn } from '@/config/phasesConfig';
import { enemyAnimationKeys } from '@/systems/EnemyAnimations';

const { fireball } = gameConfig.enemies;
const FIRST_FRAME = `${enemyAnimationKeys.fireballMove}_01`;

// Voo reto para a esquerda, na altura do peito do Muri: agachar ou pular desvia. Ao
// fim do trecho recomeça do spawn; ao acertar o Muri, é destruída. `spawn.y` é a linha
// do chão. O desenho aponta para a direita, por isso vai espelhado.
export class Fireball extends Phaser.Physics.Arcade.Sprite {
  private readonly home: EnemySpawn;

  public constructor(scene: Phaser.Scene, spawn: EnemySpawn) {
    super(scene, spawn.x, spawn.y - fireball.altitude, FIRST_FRAME);
    this.home = spawn;
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.setScale(fireball.scale).setFlipX(true);
    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setAllowGravity(false);
    body.setSize(this.width * fireball.hitbox.widthRatio, this.height * fireball.hitbox.heightRatio, true);
    if (scene.anims.exists(enemyAnimationKeys.fireballMove)) {
      this.play(enemyAnimationKeys.fireballMove);
    }
  }

  // O corpo sai do jogo na hora, para não acertar de novo, e o sprite some ao fim da
  // animação.
  public defeat(): void {
    const body = this.body as Phaser.Physics.Arcade.Body;
    body.enable = false;
    if (!this.scene.anims.exists(enemyAnimationKeys.fireballDefeat)) {
      this.destroy();
      return;
    }
    this.play(enemyAnimationKeys.fireballDefeat);
    this.once(Phaser.Animations.Events.ANIMATION_COMPLETE, () => this.destroy());
  }

  protected override preUpdate(time: number, delta: number): void {
    super.preUpdate(time, delta);
    // A animação de derrota pode terminar dentro do `super.preUpdate` e destruir o
    // sprite; aí `body` já não existe.
    if (!this.body?.enable) {
      return;
    }
    const travelled = this.home.x - this.x + (fireball.speed * delta) / 1000;
    this.setX(this.home.x - (travelled % fireball.range));
  }
}
