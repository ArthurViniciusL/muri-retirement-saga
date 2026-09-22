import Phaser from 'phaser';
import { zinc } from '@/config/palette';
import cactus001Url from '@/assets/sprites/cactus_001.png';
import cactus002Url from '@/assets/sprites/cactus_002.png';
import sunUrl from '@/assets/sprites/sun.png';
import heartEmptyUrl from '@/assets/sprites/ui_heart_empty.png';
import heartFullUrl from '@/assets/sprites/ui_heart_full.png';
import phase1Map from '@/assets/tilemaps/phase1.json?url';
import { phasesConfig } from '@/config/phasesConfig';
import { EnemyAnimations } from '@/systems/EnemyAnimations';
import { MuriAnimations } from '@/systems/MuriAnimations';
import { PlaceholderTextures, textureKeys } from '@/systems/PlaceholderTextures';
import { ThemeTiles } from '@/systems/ThemeTiles';
import { UiSound } from '@/systems/UiSound';

const BAR_WIDTH = 384;
const BAR_HEIGHT = 16;
const BAR_BORDER = 4;

export class PreloadScene extends Phaser.Scene {
  public constructor() {
    super('PreloadScene');
  }

  public preload(): void {
    const { width, height } = this.scale.gameSize;
    const x = Math.round((width - BAR_WIDTH) / 2);
    const y = Math.round((height - BAR_HEIGHT) / 2);

    const frame = this.add.graphics();
    frame.fillStyle(zinc[950], 1);
    frame.fillRect(x - BAR_BORDER, y - BAR_BORDER, BAR_WIDTH + BAR_BORDER * 2, BAR_HEIGHT + BAR_BORDER * 2);
    frame.fillStyle(zinc[50], 1);
    frame.fillRect(x, y, BAR_WIDTH, BAR_HEIGHT);

    const fill = this.add.graphics();
    this.load.on(Phaser.Loader.Events.PROGRESS, (progress: number) => {
      fill.clear();
      fill.fillStyle(zinc[950], 1);
      fill.fillRect(x, y, Math.round(BAR_WIDTH * progress), BAR_HEIGHT);
    });

    UiSound.preload(this.load);
    this.load.tilemapTiledJSON(phasesConfig.phase1.tilemapKey, phase1Map);
    ThemeTiles.preload(this.load, phasesConfig.phase1.puzzleThemeKey);
    MuriAnimations.preload(this.load);
    EnemyAnimations.preload(this.load);
    this.load.image(textureKeys.sun, sunUrl);
    this.load.image(textureKeys.heartFull, heartFullUrl);
    this.load.image(textureKeys.heartEmpty, heartEmptyUrl);
    const [cactus001, cactus002] = textureKeys.cacti;
    this.load.image(cactus001, cactus001Url);
    this.load.image(cactus002, cactus002Url);
  }

  public create(): void {
    ThemeTiles.compose(this, phasesConfig.phase1.puzzleThemeKey);
    MuriAnimations.register(this);
    EnemyAnimations.register(this);
    this.textures.get(textureKeys.sun).setFilter(Phaser.Textures.FilterMode.LINEAR);
    PlaceholderTextures.generate(this);
    this.scene.start('MenuScene');
  }
}
