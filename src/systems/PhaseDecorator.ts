import Phaser from 'phaser';
import { gameConfig } from '@/config/gameConfig';
import type { PhaseConfig, SceneryKey } from '@/config/phasesConfig';
import { SceneryAssets } from '@/systems/SceneryAssets';

const GROUND_DEPTH = 1;
const CLOUD_DEPTH = -20;

export interface SceneryAnchor {
  key: SceneryKey;
  x: number;
  y: number;
}

export class PhaseDecorator {
  /**
   * A decoração não é autorada no mapa: sai de uma semente fixa por fase, para o
   * cenário ser o mesmo em todo aparelho sem encher o Tiled de objetos.
   */
  public static scatter(
    scene: Phaser.Scene,
    config: PhaseConfig,
    worldWidth: number,
    anchors: readonly SceneryAnchor[],
  ): void {
    const rng = new Phaser.Math.RandomDataGenerator([config.decoration.seed]);
    const { decoration, parallax } = gameConfig.scenery;

    PhaseDecorator.growClusters(scene, config, rng, anchors);

    for (let index = 0; index < decoration.cloudCount; index += 1) {
      const cloud = scene.add.image(
        rng.between(0, worldWidth),
        rng.between(decoration.cloudBandMinY, decoration.cloudBandMaxY),
        config.decoration.cloudKind,
      );
      SceneryAssets.frame(cloud, config.decoration.cloudKind);
      cloud.setScrollFactor(parallax.farScrollFactor).setDepth(CLOUD_DEPTH);
    }
  }

  /**
   * Arbusto solto pela rota vira ruído e, pior, parece obstáculo. Em tríade ao pé de um
   * cacto ele lê como o mato que nasce em volta dele.
   */
  private static growClusters(
    scene: Phaser.Scene,
    config: PhaseConfig,
    rng: Phaser.Math.RandomDataGenerator,
    anchors: readonly SceneryAnchor[],
  ): void {
    const { decoration } = gameConfig.scenery;
    const kinds = config.decoration.groundKinds;
    if (kinds.length === 0) {
      return;
    }

    for (const anchor of anchors) {
      if (anchor.key !== config.decoration.clusterAround) {
        continue;
      }
      for (let index = 0; index < decoration.clusterSize; index += 1) {
        const side = index % 2 === 0 ? -1 : 1;
        const distance = rng.between(decoration.clusterMinOffset, decoration.clusterMaxOffset);
        const jitter = rng.between(-decoration.jitterX, decoration.jitterX);
        const kind: SceneryKey = rng.pick([...kinds]);
        const prop = scene.add.image(anchor.x + side * distance + jitter, anchor.y, kind);
        SceneryAssets.frame(prop, kind);
        prop.setOrigin(0.5, 1).setDepth(GROUND_DEPTH);
      }
    }
  }
}
