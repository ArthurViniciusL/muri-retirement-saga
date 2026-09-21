/**
 * Phase1Scene — Fase 1: Instrumentos.
 *
 * Responsabilidade: montar o platforming temático de instrumentos a partir do
 * PhaseConfig correspondente (tilemap, spawns de inimigos, aparição da Maryana,
 * zona de trigger do puzzle) e liberar o item essencial "Instrumento" ao final.
 * Tom introdutório: poucos inimigos, sem bolas de fogo, percurso curto.
 *
 * Referência: System Design §3, §13 (PhaseConfig), §20 (Level design — Fase 1).
 */
import Phaser from 'phaser';

// Stub: só registra a chave para a seleção de fases ter destino.
export class Phase1Scene extends Phaser.Scene {
  public constructor() {
    super('Phase1Scene');
  }
}
