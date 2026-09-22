import Phaser from 'phaser';
import { gameConfig } from '@/config/gameConfig';
import type { WorldPoint } from '@/config/phasesConfig';
import type { Intents } from '@/systems/InputController';
import { muriAnimationKeys, muriJumpTextureKey, type JumpPhase } from '@/systems/MuriAnimations';
import { textureKeys } from '@/systems/PlaceholderTextures';
import { PlayerStateMachine, type PlayerState } from '@/systems/PlayerStateMachine';

interface BodySize {
  width: number;
  height: number;
}

const { animation, physics, player } = gameConfig;

const STATE_ANIMATIONS: Partial<Record<PlayerState, string>> = {
  Idle: muriAnimationKeys.idle,
  Walk: muriAnimationKeys.walk,
  Crouch: muriAnimationKeys.crouch,
};

export class Player extends Phaser.Physics.Arcade.Sprite {
  private readonly states = new PlayerStateMachine();
  private readonly ground: Phaser.Tilemaps.TilemapLayer;
  private crouched = false;
  private jumpUsed = false;
  private jumpCut = false;
  private lastGroundedAt = Number.NEGATIVE_INFINITY;
  private lastJumpPressAt = Number.NEGATIVE_INFINITY;

  public constructor(scene: Phaser.Scene, spawn: WorldPoint, ground: Phaser.Tilemaps.TilemapLayer) {
    super(scene, spawn.x, spawn.y, textureKeys.muri);
    this.ground = ground;
    this.setOrigin(0.5, 1);
    this.setScale(player.displayHeight / this.height);
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.applyBody(player.standingBody);
    this.arcadeBody().setMaxVelocityY(physics.maxFallSpeed);
  }

  public get movementState(): PlayerState {
    return this.states.current;
  }

  public applyIntents(intents: Intents, time: number): void {
    if (this.states.current === 'Dead') {
      return;
    }
    const body = this.arcadeBody();
    const onGround = body.blocked.down;
    if (onGround) {
      this.lastGroundedAt = time;
      if (body.velocity.y >= 0) {
        this.jumpUsed = false;
      }
    }
    if (intents.jumpPressed) {
      this.lastJumpPressAt = time;
    }

    this.updateCrouch(intents.crouch && onGround);
    const direction = Number(intents.right) - Number(intents.left);
    this.move(body, direction);
    this.updateJump(body, intents, time, onGround);
    this.states.transition(this.nextState(onGround, direction));
    this.updateAnimation();
  }

  public die(): void {
    if (!this.states.transition('Dead')) {
      return;
    }
    this.stop();
    const body = this.arcadeBody();
    body.stop();
    body.setAllowGravity(false);
  }

  private updateAnimation(): void {
    const key = STATE_ANIMATIONS[this.states.current];
    if (key && this.scene.anims.exists(key)) {
      this.play(key, true);
      return;
    }
    const still = this.states.current === 'Jump' ? muriJumpTextureKey(this.jumpPhase()) : textureKeys.muri;
    const texture = this.scene.textures.exists(still) ? still : textureKeys.muri;
    if (this.anims.isPlaying || this.texture.key !== texture) {
      this.stop();
      this.setTexture(texture);
    }
  }

  private jumpPhase(): JumpPhase {
    const velocity = this.arcadeBody().velocity.y;
    if (velocity < -animation.muriJumpApexSpeed) {
      return 'rise';
    }
    return velocity > animation.muriJumpApexSpeed ? 'fall' : 'apex';
  }

  private updateCrouch(wantsCrouch: boolean): void {
    const crouched = wantsCrouch || (this.crouched && !this.canStand());
    if (crouched !== this.crouched) {
      this.crouched = crouched;
      this.applyBody(crouched ? player.crouchingBody : player.standingBody);
    }
  }

  private move(body: Phaser.Physics.Arcade.Body, direction: number): void {
    body.setVelocityX(this.crouched ? 0 : direction * physics.playerSpeed);
    if (direction !== 0) {
      this.setFlipX(direction < 0);
    }
  }

  private updateJump(body: Phaser.Physics.Arcade.Body, intents: Intents, time: number, onGround: boolean): void {
    const withinCoyote = onGround || time - this.lastGroundedAt <= physics.coyoteMs;
    const buffered = time - this.lastJumpPressAt <= physics.jumpBufferMs;
    const blockedByCeiling = this.crouched && !this.canStand();

    if (buffered && withinCoyote && !this.jumpUsed && !blockedByCeiling) {
      this.updateCrouch(false);
      body.setVelocityY(physics.jumpVelocity);
      this.jumpUsed = true;
      this.jumpCut = false;
      this.lastJumpPressAt = Number.NEGATIVE_INFINITY;
      return;
    }
    if (intents.jumpReleased && this.jumpUsed && !this.jumpCut && body.velocity.y < 0) {
      body.setVelocityY(body.velocity.y * physics.jumpCutFactor);
      this.jumpCut = true;
    }
  }

  private nextState(onGround: boolean, direction: number): PlayerState {
    if (this.crouched) {
      return 'Crouch';
    }
    if (!onGround || this.arcadeBody().velocity.y < 0) {
      return 'Jump';
    }
    return direction === 0 ? 'Idle' : 'Walk';
  }

  private canStand(): boolean {
    const { width, height } = player.standingBody;
    const extra = height - player.crouchingBody.height;
    const tiles = this.ground.getTilesWithinWorldXY(this.x - width / 2, this.y - height, width, extra, {
      isColliding: true,
    });
    return tiles.length === 0;
  }

  private applyBody({ width, height }: BodySize): void {
    const body = this.arcadeBody();
    const scale = this.scaleY;
    body.setSize(width / scale, height / scale, false);
    body.setOffset((this.width - width / scale) / 2, this.height - height / scale);
  }

  private arcadeBody(): Phaser.Physics.Arcade.Body {
    if (!(this.body instanceof Phaser.Physics.Arcade.Body)) {
      throw new Error('Player: corpo Arcade ausente.');
    }
    return this.body;
  }
}
