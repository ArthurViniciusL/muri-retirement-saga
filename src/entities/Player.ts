import Phaser from 'phaser';
import { gameConfig } from '@/config/gameConfig';
import { debugPlayerTextureKey, debugPoseFor } from '@/systems/DebugTextures';
import type { Intents } from '@/systems/InputController';
import { PlayerAssets } from '@/systems/PlayerAssets';
import { PlayerStateMachine } from '@/systems/PlayerStateMachine';
import type { PlayerState } from '@/systems/PlayerStateMachine';

type Posture = {
  readonly displayWidth: number;
  readonly displayHeight: number;
  readonly bodyWidth: number;
  readonly bodyHeight: number;
};

type DrawSize = { readonly width: number; readonly height: number };

export class Player extends Phaser.Physics.Arcade.Sprite {
  private readonly machine = new PlayerStateMachine();
  private facingLeft = false;
  private crouched = false;
  private lastGroundedAt = 0;
  private jumpBufferedAt = Number.NEGATIVE_INFINITY;

  public constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, debugPlayerTextureKey('forward'));

    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.setOrigin(0.5, 1);
    this.setBounce(0);

    const body = this.arcadeBody;
    body.setMaxVelocity(gameConfig.physics.playerSpeed, gameConfig.physics.maxFallSpeed);
    this.updateAppearance(true);
  }

  public get playerState(): PlayerState {
    return this.machine.current;
  }

  /** Terminal: the machine refuses to leave `Dead`, so the attempt ends here. */
  public die(): void {
    this.machine.transition('Dead');
    this.stop();
  }

  public step(intents: Intents, time: number): void {
    const body = this.arcadeBody;
    const onGround = body.blocked.down || body.touching.down;
    if (onGround) {
      this.lastGroundedAt = time;
    }
    if (intents.jumpPressed) {
      this.jumpBufferedAt = time;
    }

    this.updatePosture(intents, onGround);
    this.updateHorizontal(intents);
    this.updateJump(intents, time, onGround);
    this.updateState(onGround);
    this.updateAppearance(this.machine.isEntering);
  }

  private updatePosture(intents: Intents, onGround: boolean): void {
    const wanted = onGround && intents.crouch;
    if (wanted === this.crouched) {
      return;
    }
    this.crouched = wanted;
    this.applyPosture();
  }

  private updateHorizontal(intents: Intents): void {
    // Agachado é postura de defesa: fica parado, sem meio-termo de velocidade.
    const direction = this.crouched ? 0 : Number(intents.right) - Number(intents.left);
    this.setVelocityX(direction * gameConfig.physics.playerSpeed);
    if (direction !== 0) {
      this.facingLeft = direction < 0;
      this.setFlipX(this.facingLeft);
    }
  }

  private updateJump(intents: Intents, time: number, onGround: boolean): void {
    const { jumpVelocity, jumpBufferMs, coyoteMs, jumpCutFactor } = gameConfig.physics;
    const buffered = time - this.jumpBufferedAt <= jumpBufferMs;
    const grounded = onGround || time - this.lastGroundedAt <= coyoteMs;
    if (buffered && grounded && !this.crouched) {
      this.setVelocityY(jumpVelocity);
      this.jumpBufferedAt = Number.NEGATIVE_INFINITY;
      this.lastGroundedAt = Number.NEGATIVE_INFINITY;
    }
    if (intents.jumpReleased && this.arcadeBody.velocity.y < 0) {
      this.setVelocityY(this.arcadeBody.velocity.y * jumpCutFactor);
    }
  }

  private updateState(onGround: boolean): void {
    if (!onGround) {
      this.machine.transition('Jump');
      return;
    }
    if (this.crouched) {
      this.machine.transition('Crouch');
      return;
    }
    this.machine.transition(this.arcadeBody.velocity.x === 0 ? 'Idle' : 'Walk');
  }

  /**
   * `Idle` já tem arte; os outros estados seguem no retângulo de debug até a deles chegar.
   * A animação só é tocada na entrada em `Idle`: por tick ela renasceria no quadro 01.
   */
  private updateAppearance(entering: boolean): void {
    if (this.machine.current === 'Idle') {
      if (entering) {
        this.play(PlayerAssets.idleAnimation);
        this.applyPosture();
      }
      return;
    }
    if (entering) {
      this.stop();
    }
    this.updateDebugTexture();
  }

  private updateDebugTexture(): void {
    if (!gameConfig.debug.enabled) {
      return;
    }
    const key = debugPlayerTextureKey(debugPoseFor(this.machine.current, this.facingLeft));
    if (this.texture.key !== key) {
      this.setTexture(key);
      this.applyPosture();
    }
  }

  private applyPosture(): void {
    const posture = this.crouched ? gameConfig.player.crouching : gameConfig.player.standing;
    const draw = this.drawSizeFor(posture);
    this.setDisplaySize(draw.width, draw.height);
    this.fitBodyTo(posture);
  }

  /** O desenho muda de tamanho entre arte e debug; a hitbox de `posture`, nunca. */
  private drawSizeFor(posture: Posture): DrawSize {
    if (this.machine.current === 'Idle') {
      // Idle só acontece em pé, então a arte agachada não entra na conta.
      return gameConfig.player.artDisplay.standing;
    }
    return { width: posture.displayWidth, height: posture.displayHeight };
  }

  /**
   * O corpo é dado em pixels da textura e o Arcade o multiplica pela escala do sprite.
   * Dividir pela escala mantém 40×88 no mundo tanto no debug quanto na arte reduzida.
   */
  private fitBodyTo(posture: Posture): void {
    const body = this.arcadeBody;
    body.setSize(posture.bodyWidth / this.scaleX, posture.bodyHeight / this.scaleY, false);
    body.setOffset(
      (this.displayWidth - posture.bodyWidth) / 2 / this.scaleX,
      (this.displayHeight - posture.bodyHeight) / this.scaleY,
    );
  }

  private get arcadeBody(): Phaser.Physics.Arcade.Body {
    if (this.body instanceof Phaser.Physics.Arcade.Body) {
      return this.body;
    }
    throw new Error('Player precisa de um corpo de Arcade Physics.');
  }
}
