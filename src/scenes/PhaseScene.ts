import Phaser from 'phaser';
import { gameConfig } from '@/config/gameConfig';
import { palette } from '@/config/palette';
import type { PhaseConfig, SceneryKey } from '@/config/phasesConfig';
import { Coin } from '@/entities/Coin';
import { Obstacle, obstacleKindOf } from '@/entities/Obstacle';
import { Player } from '@/entities/Player';
import type { GameOverData } from '@/scenes/GameOverScene';
import { CurrencySystem } from '@/systems/CurrencySystem';
import { HealthSystem } from '@/systems/HealthSystem';
import { InputController } from '@/systems/InputController';
import { ParallaxBackdrop } from '@/systems/ParallaxBackdrop';
import { PhaseDecorator, type SceneryAnchor } from '@/systems/PhaseDecorator';
import { PhaseTileset } from '@/systems/PhaseTileset';
import type { PhaseSceneKey } from '@/systems/PhaseProgress';
import { DebugOverlay } from '@/ui/DebugOverlay';
import { CoinsHUD } from '@/ui/CoinsHUD';
import { HeartsHUD } from '@/ui/HeartsHUD';
import { Motion } from '@/ui/Motion';

const GROUND_LAYER = 'ground';
const OBSTACLE_LAYER = 'obstacles';
const COIN_LAYER = 'coins';
const TILESET_NAME = 'tiles';
const PLAYER_DEPTH = 10;

type ArcadeOverlapObject = Parameters<Phaser.Types.Physics.Arcade.ArcadePhysicsCallback>[0];

export class PhaseScene extends Phaser.Scene {
  protected readonly config: PhaseConfig;
  private readonly sceneKey: PhaseSceneKey;
  private player!: Player;
  private controls!: InputController;
  private ground!: Phaser.Tilemaps.TilemapLayer;
  private health = new HealthSystem();
  private wallet = new CurrencySystem();
  private heartsHud!: HeartsHUD;
  private coinsHud!: CoinsHUD;
  private overlay: DebugOverlay | undefined;
  private hurtContacts = new Set<string>();
  private previousHurtContacts = new Set<string>();
  private dying = false;
  private now = 0;

  public constructor(key: PhaseSceneKey, config: PhaseConfig) {
    super(key);
    this.sceneKey = key;
    this.config = config;
  }

  public create(): void {
    this.health = new HealthSystem();
    this.wallet = new CurrencySystem();
    this.hurtContacts = new Set<string>();
    this.previousHurtContacts = new Set<string>();
    this.dying = false;

    PhaseTileset.compose(this, this.config);
    const map = this.make.tilemap({ key: this.config.tilemapKey });
    const tileset = map.addTilesetImage(TILESET_NAME, this.config.scenery.tilesetKey);
    const ground = tileset === null ? null : map.createLayer(GROUND_LAYER, tileset, 0, 0);
    if (ground === null) {
      throw new Error(`${this.config.id}: tilemap sem a camada "${GROUND_LAYER}".`);
    }
    this.ground = ground;
    this.ground.setCollisionByProperty({ collides: true });

    this.cameras.main.setBackgroundColor(palette[this.config.parallax.skyTone]);
    ParallaxBackdrop.create(this, this.config, map.widthInPixels);

    const solids = this.physics.add.staticGroup();
    const hazards = this.physics.add.staticGroup();
    const anchors = this.createObstacles(map, solids, hazards);
    const coins = this.createCoins(map);
    Coin.spin(this, coins);
    PhaseDecorator.scatter(this, this.config, map.widthInPixels, anchors);

    this.player = new Player(this, this.config.playerSpawn.x, this.config.playerSpawn.y);
    this.player.setDepth(PLAYER_DEPTH);

    this.physics.world.TILE_BIAS = gameConfig.physics.tileBias;
    this.physics.world.setBounds(0, 0, map.widthInPixels, this.config.worldHeight);
    this.physics.world.setBoundsCollision(true, true, false, false);
    this.physics.add.collider(this.player, this.ground);
    this.physics.add.collider(this.player, solids);
    this.physics.add.collider(this.player, hazards, this.onHazardContact, undefined, this);
    this.physics.add.overlap(this.player, coins, this.onCoinOverlap, undefined, this);

    const camera = this.cameras.main;
    camera.setBounds(0, 0, map.widthInPixels, this.config.worldHeight);
    camera.startFollow(this.player, true, gameConfig.camera.lerp, gameConfig.camera.lerp);
    camera.setDeadzone(
      camera.width * gameConfig.camera.deadzoneWidthRatio,
      camera.height * gameConfig.camera.deadzoneHeightRatio,
    );

    this.controls = new InputController(this);
    this.heartsHud = new HeartsHUD(this);
    this.coinsHud = new CoinsHUD(this);
    this.coinsHud.layout(gameConfig.hud.iconHeight + gameConfig.hud.rowGap);
    this.overlay = gameConfig.debug.enabled ? new DebugOverlay(this) : undefined;

    this.scale.on(Phaser.Scale.Events.RESIZE, this.layout, this);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.scale.off(Phaser.Scale.Events.RESIZE, this.layout, this);
    });
  }

  public override update(time: number): void {
    this.now = time;
    if (this.dying) {
      return;
    }

    this.player.step(this.controls.read(), time);

    if (this.player.y > this.config.worldHeight) {
      this.dieFromFall();
      return;
    }

    this.renderHud();
    this.previousHurtContacts = this.hurtContacts;
    this.hurtContacts = new Set<string>();
  }

  private renderHud(): void {
    this.heartsHud.render(this.health.remaining);
    this.coinsHud.render(this.wallet.collected);
    this.overlay?.render(this.player.playerState);
  }

  private layout(): void {
    this.controls.layout();
    const camera = this.cameras.main;
    camera.setDeadzone(
      camera.width * gameConfig.camera.deadzoneWidthRatio,
      camera.height * gameConfig.camera.deadzoneHeightRatio,
    );
  }

  private createObstacles(
    map: Phaser.Tilemaps.Tilemap,
    solids: Phaser.Physics.Arcade.StaticGroup,
    hazards: Phaser.Physics.Arcade.StaticGroup,
  ): SceneryAnchor[] {
    const anchors: SceneryAnchor[] = [];
    for (const object of map.getObjectLayer(OBSTACLE_LAYER)?.objects ?? []) {
      const kind = obstacleKindOf(object.type ?? '');
      if (kind === undefined || object.x === undefined || object.y === undefined) {
        continue;
      }
      const key: SceneryKey = this.sceneryKeyOf(object.type ?? '');
      Obstacle.create(kind === 'blocks' ? solids : hazards, key, object.x, object.y);
      anchors.push({ key, x: object.x, y: object.y });
    }
    return anchors;
  }

  private createCoins(map: Phaser.Tilemaps.Tilemap): Phaser.Physics.Arcade.StaticGroup {
    const coins = this.physics.add.staticGroup();
    for (const object of map.getObjectLayer(COIN_LAYER)?.objects ?? []) {
      if (object.x !== undefined && object.y !== undefined) {
        Coin.create(coins, object.x, object.y);
      }
    }
    return coins;
  }

  private sceneryKeyOf(type: string): SceneryKey {
    const keys = Object.keys(gameConfig.scenery.targets);
    const found = keys.find((key) => key === type);
    if (found === undefined || !this.isSceneryKey(found)) {
      throw new Error(`${this.config.id}: objeto "${type}" não tem asset de cenário.`);
    }
    return found;
  }

  private isSceneryKey(key: string): key is SceneryKey {
    return key in gameConfig.scenery.targets;
  }

  private onHazardContact(
    _player: ArcadeOverlapObject,
    hazard: ArcadeOverlapObject,
  ): void {
    if (this.dying || !(hazard instanceof Phaser.GameObjects.GameObject)) {
      return;
    }
    const source = hazard.name;
    this.hurtContacts.add(source);
    if (!this.previousHurtContacts.has(source) && this.health.loseHeart(source, this.now)) {
      this.shakeOnDamage();
      if (this.health.remaining === 0) {
        this.dieFromDamage();
      }
    }
  }

  /**
   * The beat runs on the scene clock, which keeps ticking while the Arcade world is
   * paused, so a Muri who died airborne hangs there until the game over.
   */
  private dieFromDamage(): void {
    this.dying = true;
    this.player.die();
    this.renderHud();
    this.physics.pause();
    this.controls.reset();
    this.time.delayedCall(gameConfig.combat.deathBeatMs, () => this.openGameOver());
  }

  /** Fell out of the world: Muri is already off-screen, so there is no beat and no shake to watch. */
  private dieFromFall(): void {
    this.dying = true;
    this.player.die();
    this.controls.reset();
    this.openGameOver();
  }

  private openGameOver(): void {
    const data: GameOverData = { phase: this.sceneKey };
    this.scene.start('GameOverScene', data);
  }

  private shakeOnDamage(): void {
    if (Motion.isReduced()) {
      return;
    }
    this.cameras.main.shake(gameConfig.camera.damageShakeMs, gameConfig.camera.damageShakeIntensity);
  }

  private onCoinOverlap(
    _player: ArcadeOverlapObject,
    coin: ArcadeOverlapObject,
  ): void {
    if (coin instanceof Phaser.Physics.Arcade.Sprite) {
      coin.disableBody(true, true);
      this.wallet.add();
    }
  }
}
