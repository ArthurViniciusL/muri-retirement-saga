import type Phaser from 'phaser';
import uiClickOgg from '@/assets/audio/ui_click.ogg';
import uiClickM4a from '@/assets/audio/ui_click.m4a';
import { gameConfig } from '@/config/gameConfig';

const CLICK_KEY = 'ui_click';

export class UiSound {
  public static preload(loader: Phaser.Loader.LoaderPlugin): void {
    // Mesma chamada com .ogg e .m4a: Chrome toca o ogg, Safari no iOS toca o m4a.
    loader.audio(CLICK_KEY, [uiClickOgg, uiClickM4a]);
  }

  public static click(scene: Phaser.Scene): void {
    if (scene.cache.audio.exists(CLICK_KEY)) {
      scene.sound.play(CLICK_KEY, { volume: gameConfig.audio.uiClickVolume });
    }
  }
}
