/**
 * gameConfig — configuração do Phaser.Game.
 *
 * Responsabilidade: centralizar o objeto de configuração da engine — Arcade Physics
 * com gravidade, modo de scale para landscape em Chrome mobile, renderização pixel
 * art (sem suavização) e a ordem de registro das cenas.
 *
 * Referência: System Design §2 (Stack técnica), §3 (cenas), §14 (landscape);
 * Guia de Estilo §4 (Grid e escala dos sprites).
 */
export const gameConfig = {
  render: {
    logicalHeight: 576, // travado; 9 tiles de 64 px
    minLogicalWidth: 1024, // o level design assume esta largura visível
    maxLogicalWidth: 1440,
    pixelArt: true,
    roundPixels: true,
    antialias: false,
  },
  physics: {
    gravityY: 1800,
    playerSpeed: 220,
    jumpVelocity: -620, // alcança uma plataforma 128 px (2 tiles) acima
  },
  combat: {
    damageCooldownMs: 400, // cooldown técnico; não há i-frames
    maxHearts: 5,
  },
  camera: {
    lerp: 0.12,
    deadzoneWidthRatio: 0.3,
    deadzoneHeightRatio: 0.4,
  },
  audio: {
    startMenuVolume: 0.5,
  },
} as const;

/**
 * Largura lógica elástica: `576 × (largura / altura)` da tela, limitada a
 * [1024, 1440]. A altura lógica nunca varia.
 */
export function logicalWidthFor(viewportWidth: number, viewportHeight: number): number {
  const { logicalHeight, minLogicalWidth, maxLogicalWidth } = gameConfig.render;
  const aspect = viewportHeight > 0 ? viewportWidth / viewportHeight : 0;
  const width = Math.round(logicalHeight * aspect);
  return Math.min(maxLogicalWidth, Math.max(minLogicalWidth, width));
}
