import Phaser from 'phaser';
import startMenuOgg from '@/assets/audio/start_menu.ogg';
import startMenuM4a from '@/assets/audio/start_menu.m4a';
import { gameConfig } from '@/config/gameConfig';

const AUDIO_KEY = 'start_menu';

let track: Phaser.Sound.BaseSound | undefined;
let wanted = false;
let listeningToVisibility = false;

export class MenuMusic {
  public static start(scene: Phaser.Scene): void {
    if (wanted) {
      return;
    }
    wanted = true;
    MenuMusic.pauseWhileHidden(scene.game);

    if (scene.cache.audio.exists(AUDIO_KEY)) {
      MenuMusic.playWhenUnlocked(scene.sound);
    } else {
      MenuMusic.loadThenPlay(scene);
    }
  }

  public static stop(): void {
    wanted = false;
    track?.stop();
    track?.destroy();
    track = undefined;
  }

  private static loadThenPlay(scene: Phaser.Scene): void {
    // O carregador morre com a cena; a próxima tela de menu recomeça o download.
    const abandonLoad = (): void => {
      wanted = false;
    };
    scene.events.once(Phaser.Scenes.Events.SHUTDOWN, abandonLoad);
    // Mesma chamada com .ogg e .m4a: Chrome toca o ogg, Safari no iOS toca o m4a.
    scene.load.audio(AUDIO_KEY, [startMenuOgg, startMenuM4a]);
    scene.load.once(Phaser.Loader.Events.COMPLETE, () => {
      scene.events.off(Phaser.Scenes.Events.SHUTDOWN, abandonLoad);
      MenuMusic.playWhenUnlocked(scene.sound);
    });
    scene.load.start();
  }

  private static playWhenUnlocked(sound: Phaser.Sound.BaseSoundManager): void {
    if (sound.locked) {
      sound.once(Phaser.Sound.Events.UNLOCKED, () => MenuMusic.play(sound));
    } else {
      MenuMusic.play(sound);
    }
  }

  private static play(sound: Phaser.Sound.BaseSoundManager): void {
    if (track || !wanted) {
      return;
    }
    track = sound.add(AUDIO_KEY, { volume: gameConfig.audio.startMenuVolume, loop: true });
    track.play();
  }

  // O Phaser só pausa no `blur`; trocar de app no celular às vezes só esconde a página.
  private static pauseWhileHidden(game: Phaser.Game): void {
    if (listeningToVisibility) {
      return;
    }
    listeningToVisibility = true;
    game.events.on(Phaser.Core.Events.HIDDEN, () => track?.pause());
    game.events.on(Phaser.Core.Events.VISIBLE, () => track?.resume());
  }
}
