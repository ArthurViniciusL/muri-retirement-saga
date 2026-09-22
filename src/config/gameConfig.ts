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
    jumpVelocity: -840, // pico ~196 px: passa bem acima de um obstáculo de 96 px
    jumpCutFactor: 0.45, // subida mantida ao soltar o pulo
    coyoteMs: 80,
    jumpBufferMs: 100,
    maxFallSpeed: 1200,
    tileBias: 32, // sem isto o corpo atravessa o tile na velocidade máxima de queda
  },
  combat: {
    damageCooldownMs: 400, // cooldown técnico; não há i-frames
    maxHearts: 5,
    // baseline: pausa entre perder o último coração e o game over. O mundo congela e o
    // beat dá tempo de ler a morte como consequência, não como um corte seco.
    deathBeatMs: 800,
  },
  player: {
    standing: {
      displayWidth: 64,
      displayHeight: 96,
      bodyWidth: 40,
      bodyHeight: 88,
    },
    crouching: {
      displayWidth: 64,
      displayHeight: 64,
      bodyWidth: 40,
      bodyHeight: 56,
    },
    // baseline: a arte do parado é 190×550 (proporção 0.35) e o grid de 64 px pede
    // 64×96. O owner vai reenquadrar a arte; até lá ela é desenhada na proporção da
    // fonte, ancorada nos 96 px de `standing` para que o desenho e a hitbox concordem
    // sobre a altura do Muri diante de um obstáculo de 96 px. A hitbox não muda.
    artDisplay: {
      standing: { width: 33, height: 96 },
    },
    animations: {
      idle: {
        frameCount: 2, // stoped_001 e stoped_002
        frameDurationMs: 500, // baseline: ciclo de 1 s; a respiração some abaixo disso
        repeat: -1, // loop infinito; com dois quadros, ping-pong seria a mesma sequência
      },
    },
  },
  hud: {
    margin: 64, // fora dos recortes de câmera e da barra de gestos
    iconWidth: 32,
    iconHeight: 30, // a arte é 33×31; 32×30 mantém a proporção no grid do HUD
    iconGap: 8,
    heartFlashMs: 90, // o quadro pela metade entre cheio e vazio
    heartPulseMs: 140,
    heartPulseScale: 1.25,
    rowGap: 12, // entre a linha dos corações e a das moedas
    coinPulseMs: 160,
    coinPulseScale: 1.3,
  },
  controls: {
    margin: 64,
    buttonSize: 128,
    buttonHitRadius: 72,
    buttonGap: 16,
    pauseSize: 64,
    pauseHitSize: 96,
  },
  scenery: {
    tileSize: 64,
    tileOutlineDisplayPx: 4,
    maxObstacleHeight: 96,
    coinSize: 32,
    coinSpinMs: 1100, // volta completa; a face de frente aparece duas vezes por volta
    // A arte de perfil já ocupa 35% da largura do próprio quadro: é essa fração que
    // define quando trocar de face, e o quadro de perfil é desenhado em tamanho cheio.
    coinSideFillRatio: 0.353,
    // Os PNGs vêm aparados, sem padding; sobra o contorno de 1 px autoral e o fator
    // de ampliação de cada arquivo (ver .agents/docs/scenery-assets.md).
    sourcePaddingPx: 0,
    sourceOutlinePx: 1,
    sourceUpscale: {
      brick_wall: 8,
      wooden_wall: 12,
    },
    // Tamanhos de exibição por asset: ver .agents/docs/scenery-assets.md.
    targets: {
      brick_wall: { width: 64, height: 64 },
      wooden_wall: { width: 64, height: 64 },
      cactus: { width: 77, height: 96 },
      cactus_red: { width: 77, height: 96 },
      campfire: { width: 74, height: 96 },
      rock_formation: { width: 73, height: 64 },
      stone_rock: { width: 61, height: 64 },
      wooden_barrel: { width: 51, height: 64 },
      woodlog: { width: 107, height: 64 },
      pebble: { width: 64, height: 48 },
      fox_car: { width: 140, height: 96 },
      foliage: { width: 49, height: 40 },
      fluffy_cloud: { width: 128, height: 79 },
      coin: { width: 32, height: 32 },
    },
    decoration: {
      clusterSize: 3, // arbustos nascem em tríade, nunca sozinhos
      clusterMinOffset: 56, // do centro do cacto até o arbusto mais próximo
      clusterMaxOffset: 132,
      jitterX: 10,
      cloudCount: 14,
      cloudBandMinY: 32,
      cloudBandMaxY: 320,
    },
    parallax: {
      farScrollFactor: 0.25,
      midScrollFactor: 0.5,
      hillCount: 9,
      hillMinWidth: 320,
      hillMaxWidth: 720,
      hillMinHeight: 96,
      hillMaxHeight: 224,
      hillOutlineWidth: 4,
    },
  },
  debug: {
    // Fica ligado até TODOS os estados terem arte: com só o parado pronto, desligar
    // deixaria o Muri andando e pulando no quadro do parado, o que lê pior que o
    // retângulo.
    enabled: true,
  },
  camera: {
    lerp: 0.12,
    deadzoneWidthRatio: 0.3,
    deadzoneHeightRatio: 0.4,
    damageShakeMs: 180,
    damageShakeIntensity: 0.006, // leve: ~3 px na altura lógica de 576
  },
  audio: {
    startMenuVolume: 0.5,
    uiClickVolume: 0.7,
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
