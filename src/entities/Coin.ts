import Phaser from 'phaser';
import { gameConfig } from '@/config/gameConfig';
import { COIN_FRAME_KEYS, SceneryAssets } from '@/systems/SceneryAssets';

const FRONT = COIN_FRAME_KEYS[0];
const SIDE = COIN_FRAME_KEYS[1];

export class Coin {
  public static create(group: Phaser.Physics.Arcade.StaticGroup, x: number, y: number): Phaser.Physics.Arcade.Sprite {
    const coin: Phaser.Physics.Arcade.Sprite = group.create(x, y, FRONT);
    SceneryAssets.frame(coin, 'coin');
    coin.refreshBody();
    return coin;
  }

  /**
   * Duas faces não fazem um giro: a largura da face de frente segue um cosseno e a face
   * de perfil assume quando a moeda fica estreita o bastante para as duas coincidirem.
   * Um tween só, para todas as moedas da fase.
   */
  public static spin(scene: Phaser.Scene, group: Phaser.Physics.Arcade.StaticGroup): void {
    const { coinSize, coinSpinMs, coinSideFillRatio } = gameConfig.scenery;
    const turn = { angle: 0 };

    scene.tweens.add({
      targets: turn,
      angle: Math.PI * 2,
      duration: coinSpinMs,
      repeat: -1,
      ease: 'Linear',
      onUpdate: () => {
        const openness = Math.abs(Math.cos(turn.angle));
        // No quadro de perfil a própria arte já é estreita, então ele entra em tamanho
        // cheio: encolhê-lo de novo faria a moeda sumir no meio do giro.
        const facingSide = openness < coinSideFillRatio;
        const width = facingSide ? coinSize : Math.round(coinSize * openness);
        for (const child of group.getChildren()) {
          if (!(child instanceof Phaser.Physics.Arcade.Sprite) || !child.visible) {
            continue;
          }
          child.setTexture(facingSide ? SIDE : FRONT);
          child.setDisplaySize(width, coinSize);
        }
      },
    });
  }
}
