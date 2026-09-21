/**
 * MenuMusic — faixa de fundo da tela inicial.
 *
 * Responsabilidade: carregar em segundo plano e tocar em loop o áudio `start_menu`,
 * uma vez por carga, e pará-lo ao sair do menu. O estado é do módulo, não da cena:
 * girar o aparelho reinicia a MenuScene para refazer o layout, e a música não pode
 * recomeçar a cada giro.
 *
 * O Phaser só pausa o som quando a janela perde o foco (`blur`). Trocar de app no
 * celular ou de aba às vezes só esconde a página, sem `blur` — então a faixa também
 * pausa quando a página fica oculta e volta quando ela reaparece.
 *
 * A faixa é carregada aqui, e não na PreloadScene: são quase 2 minutos de áudio, e
 * segurar a primeira tela por ela numa rede de festa lotada faz o convidado desistir.
 *
 * Referência: `.agents/rules/audio-style-and-loading.md`.
 */
import Phaser from 'phaser';
import startMenuOgg from '@/assets/audio/start_menu.ogg';
import startMenuM4a from '@/assets/audio/start_menu.m4a';
import { gameConfig } from '@/config/gameConfig';

const AUDIO_KEY = 'start_menu';

let track: Phaser.Sound.BaseSound | undefined;
let requested = false;

export class MenuMusic {
  /**
   * Carrega e toca a faixa. O navegador só libera som depois de um toque: se o áudio
   * estiver bloqueado, ele começa no primeiro toque — a menos que `isStillWanted`
   * diga que o menu já foi deixado (o toque foi o próprio "Iniciar").
   */
  public static start(scene: Phaser.Scene, isStillWanted: () => boolean): void {
    if (requested) {
      return;
    }
    requested = true;
    MenuMusic.pauseWhileHidden(scene.game);

    const play = (): void => {
      if (track || !isStillWanted()) {
        return;
      }
      track = scene.sound.add(AUDIO_KEY, { volume: gameConfig.audio.startMenuVolume, loop: true });
      track.play();
    };
    const playWhenUnlocked = (): void => {
      if (scene.sound.locked) {
        scene.sound.once(Phaser.Sound.Events.UNLOCKED, play);
      } else {
        play();
      }
    };

    if (scene.cache.audio.exists(AUDIO_KEY)) {
      playWhenUnlocked();
      return;
    }
    // Mesma chamada com .ogg e .m4a: Chrome toca o ogg, Safari no iOS toca o m4a.
    scene.load.audio(AUDIO_KEY, [startMenuOgg, startMenuM4a]);
    scene.load.once(Phaser.Loader.Events.COMPLETE, playWhenUnlocked);
    scene.load.start();
  }

  public static stop(): void {
    track?.stop();
    track?.destroy();
    track = undefined;
  }

  private static pauseWhileHidden(game: Phaser.Game): void {
    game.events.on(Phaser.Core.Events.HIDDEN, () => track?.pause());
    game.events.on(Phaser.Core.Events.VISIBLE, () => track?.resume());
  }
}
