/**
 * Phase3Scene — Fase 3: Moedas.
 *
 * Responsabilidade: montar o platforming temático de moedas a partir do PhaseConfig
 * correspondente (maior densidade dos três tipos de inimigo, aparições da Weruska,
 * zona de trigger do puzzle) e liberar o item essencial "Dinheiro da aposentadoria",
 * que habilita a VictoryScene. Fase final, a mais longa e desafiadora.
 *
 * Referência: System Design §3, §13 (PhaseConfig), §20 (Level design — Fase 3).
 */
import Phaser from 'phaser';

// Stub: só registra a chave para a seleção de fases ter destino.
export class Phase3Scene extends Phaser.Scene {
  public constructor() {
    super('Phase3Scene');
  }
}
