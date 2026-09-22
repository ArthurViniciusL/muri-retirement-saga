import Phaser from 'phaser';
import { gameConfig } from '@/config/gameConfig';
import { zinc } from '@/config/palette';
import type { PhaseConfig } from '@/config/phasesConfig';
import { Player } from '@/entities/Player';
import { Bat } from '@/entities/enemies/Bat';
import { Fireball } from '@/entities/enemies/Fireball';
import { HealthSystem } from '@/systems/HealthSystem';
import { InputController } from '@/systems/InputController';
import { textureKeys } from '@/systems/PlaceholderTextures';
import { ThemeTiles } from '@/systems/ThemeTiles';
import type { PhaseSceneKey } from '@/systems/PhaseProgress';
import { HeartsHUD } from '@/ui/HeartsHUD';

export interface PhaseOverlayData {
  phaseKey: string;
}

type OverlayKey = 'PauseScene' | 'GameOverScene';

const TILESET_NAME = 'tiles';
const GROUND_LAYER = 'ground';
const CACTI_LAYER = 'cacti';

export abstract class PhaseScene extends Phaser.Scene {
  private readonly config: PhaseConfig;
  private player!: Player;
  private controls!: InputController;
  private health!: HealthSystem;
  private hearts!: HeartsHUD;
  private ended = false;

  protected constructor(key: PhaseSceneKey, config: PhaseConfig) {
    super(key);
    this.config = config;
  }

  public create(): void {
    this.ended = false;
    const map = this.make.tilemap({ key: this.config.tilemapKey });
    const tileset = map.addTilesetImage(TILESET_NAME, ThemeTiles.tilesetKey(this.config.puzzleThemeKey));
    if (!tileset) {
      throw new Error(`PhaseScene: tileset "${TILESET_NAME}" ausente em "${this.config.tilemapKey}".`);
    }

    const worldWidth = map.widthInPixels;
    const { worldHeight } = this.config;
    this.cameras.main.setBackgroundColor(zinc[100]);
    this.addParallax(worldWidth, worldHeight);

    const ground = map.createLayer(GROUND_LAYER, tileset);
    if (!ground) {
      throw new Error(`PhaseScene: camada "${GROUND_LAYER}" ausente em "${this.config.tilemapKey}".`);
    }
    ground.setCollisionByProperty({ collides: true });

    this.physics.world.setBounds(0, 0, worldWidth, worldHeight, true, true, false, false);
    const cacti = this.addCacti(map);
    this.player = new Player(this, this.config.playerSpawn, ground);
    this.physics.add.collider(this.player, ground);
    this.health = new HealthSystem();
    this.hearts = new HeartsHUD(this, this.health.max);
    this.physics.add.overlap(this.player, cacti, (_player, cactus) => this.hurt(cactus));
    const { enemySpawns } = this.config;
    const bats = enemySpawns.filter((spawn) => spawn.type === 'bat').map((spawn) => new Bat(this, spawn));
    const fireballs = enemySpawns.filter((spawn) => spawn.type === 'fireball').map((spawn) => new Fireball(this, spawn));
    this.physics.add.overlap(this.player, bats, (_player, bat) => this.hurt(bat));
    this.physics.add.overlap(this.player, fireballs, (_player, fireball) => {
      if (fireball instanceof Fireball) {
        this.hurt(fireball);
        fireball.defeat();
      }
    });

    const camera = this.cameras.main;
    camera.setBounds(0, 0, worldWidth, worldHeight);
    camera.startFollow(this.player, true, gameConfig.camera.lerp, gameConfig.camera.lerp);
    this.applyDeadzone();

    this.controls = new InputController(this);

    this.scale.on(Phaser.Scale.Events.RESIZE, this.handleResize, this);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.scale.off(Phaser.Scale.Events.RESIZE, this.handleResize, this);
    });
  }

  public override update(time: number): void {
    if (this.ended) {
      return;
    }
    const intents = this.controls.read();
    if (intents.pausePressed) {
      this.openOverlay('PauseScene');
      return;
    }
    this.player.applyIntents(intents, time);
    if (this.player.y - this.player.displayHeight > this.config.worldHeight) {
      this.endRun();
    }
  }

  private addCacti(map: Phaser.Tilemaps.Tilemap): Phaser.Physics.Arcade.StaticGroup {
    const { cactusScale, cactusHitbox } = gameConfig.hazards;
    const known: readonly string[] = textureKeys.cacti;
    const cacti = this.physics.add.staticGroup();
    for (const { type, x = 0, y = 0 } of map.getObjectLayer(CACTI_LAYER)?.objects ?? []) {
      if (!known.includes(type) || !this.textures.exists(type)) {
        continue;
      }
      const cactus = cacti.create(x, y, type) as Phaser.Physics.Arcade.Image;
      cactus.setOrigin(0.5, 1).setScale(cactusScale).refreshBody();
      const body = cactus.body as Phaser.Physics.Arcade.StaticBody;
      const width = cactus.displayWidth * cactusHitbox.widthRatio;
      const height = cactus.displayHeight * cactusHitbox.heightRatio;
      body.setSize(width, height, false);
      body.setOffset((cactus.displayWidth - width) / 2, cactus.displayHeight - height);
    }
    return cacti;
  }

  private hurt(source: object): void {
    if (this.ended || !this.health.hit(source, this.time.now)) {
      return;
    }
    this.hearts.render(this.health.current);
    const { durationMs, intensity } = gameConfig.camera.hurtShake;
    this.cameras.main.shake(durationMs, intensity);
    if (this.health.empty) {
      this.endRun();
    }
  }

  private endRun(): void {
    this.ended = true;
    this.player.die();
    this.openOverlay('GameOverScene');
  }

  private addParallax(worldWidth: number, worldHeight: number): void {
    const { logicalHeight, maxLogicalWidth } = gameConfig.render;
    const layers = [
      { key: textureKeys.parallaxFar, factor: gameConfig.parallax.farScrollFactor },
      { key: textureKeys.parallaxMid, factor: gameConfig.parallax.midScrollFactor },
    ];
    for (const { key, factor } of layers) {
      const height = this.textures.getFrame(key).height;
      // Ancorada para encostar no rodapé da tela quando a câmera chega ao fundo do mundo.
      const bottom = logicalHeight + (worldHeight - logicalHeight) * factor;
      const width = Math.ceil(maxLogicalWidth + worldWidth * factor);
      this.add.tileSprite(0, bottom - height, width, height, key).setOrigin(0, 0).setScrollFactor(factor);
      if (key === textureKeys.parallaxFar) {
        this.addSuns(bottom - height, Math.ceil(gameConfig.render.minLogicalWidth + worldWidth * factor), factor);
      }
    }
  }

  // `visibleWidth` é o trecho da camada que a câmera chega a mostrar na tela mais estreita.
  private addSuns(layerTop: number, visibleWidth: number, factor: number): void {
    if (!this.textures.exists(textureKeys.sun)) {
      return;
    }
    const { firstX, spacing, y, size, spinMs, pulseScale, pulseMs } = gameConfig.parallax.sun;
    const between = ([min, max]: readonly [number, number]): number => Phaser.Math.Between(min, max);
    for (let x = between(firstX); x < visibleWidth; x += between(spacing)) {
      const diameter = between(size);
      const sun = this.add
        .image(x, layerTop + between(y), textureKeys.sun)
        .setScrollFactor(factor)
        .setDisplaySize(diameter, diameter)
        .setAngle(between([0, 359]));
      const turn = Phaser.Math.RND.sign() * 360;
      this.tweens.add({ targets: sun, angle: sun.angle + turn, duration: between(spinMs), repeat: -1 });
      this.tweens.add({
        targets: sun,
        scale: sun.scale * (1 + pulseScale),
        duration: between(pulseMs),
        ease: 'Sine.easeInOut',
        yoyo: true,
        repeat: -1,
      });
    }
  }

  private applyDeadzone(): void {
    const camera = this.cameras.main;
    const { deadzoneWidthRatio, deadzoneHeightRatio } = gameConfig.camera;
    camera.setDeadzone(camera.width * deadzoneWidthRatio, camera.height * deadzoneHeightRatio);
  }

  private handleResize(): void {
    this.applyDeadzone();
    this.controls.layout();
  }

  private openOverlay(key: OverlayKey): void {
    const data: PhaseOverlayData = { phaseKey: this.scene.key };
    this.scene.pause();
    this.scene.launch(key, data);
  }
}
