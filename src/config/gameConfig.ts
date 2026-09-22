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
    gravityY: 2700,
    playerSpeed: 330,
    jumpVelocity: -1080, // pico ≈ 216 px: 1,5× o pulo original, na escala do Muri de 144 px
    jumpCutFactor: 0.45,
    coyoteMs: 80,
    jumpBufferMs: 100,
    maxFallSpeed: 1800, // 30 px por passo a 60 Hz: abaixo do tileBias
    tileBias: 48, // o padrão (16) deixa a queda longa atravessar o chão
  },
  player: {
    displayHeight: 144, // altura do quadro de caminhada na tela; os desenhos são reduzidos
    standingBody: { width: 60, height: 132 },
    crouchingBody: { width: 60, height: 84 },
  },
  combat: {
    damageCooldownMs: 400, // cooldown técnico; não há i-frames
    maxHearts: 5,
  },
  enemies: {
    // Base de playtest: velocidade e rota seguem em aberto (content-open-decisions.md).
    bat: {
      scale: 1.5,
      flyFps: 10,
      defeatFps: 12,
      hitbox: { widthRatio: 0.5, heightRatio: 0.4 },
      patrolWidth: 384,
      patrolMs: 4000,
      swoopMs: 3000,
      highAltitude: 300, // centro acima do chão; fora do alcance sem pular
      lowAltitude: 112, // atinge a cabeça do Muri em pé (132) e passa por cima agachado (84)
    },
    fireball: {
      scale: 1.5,
      moveFps: 10,
      defeatFps: 12,
      hitbox: { widthRatio: 0.55, heightRatio: 0.45 },
      speed: 260,
      range: 380, // voa isso para a esquerda do spawn e recomeça do spawn
      altitude: 110, // centro acima do chão; acerta o Muri em pé (132) e passa por cima agachado (84)
    },
  },
  hazards: {
    cactusScale: 1.5, // na escala do Muri de 144 px
    cactusHitbox: { widthRatio: 0.6, heightRatio: 0.85 }, // menor que o desenho, para não punir raspão
  },
  hud: {
    margin: 64,
    iconSize: 32,
    iconGap: 8,
  },
  camera: {
    lerp: 0.12,
    deadzoneWidthRatio: 0.3,
    deadzoneHeightRatio: 0.4,
    hurtShake: { durationMs: 200, intensity: 0.01 }, // fração da tela; 0,01 ≈ 6 px na altura
  },
  animation: {
    muriIdleFps: 2,
    muriWalkFps: 12,
    muriCrouchFps: 12,
    muriStandInFrame: 6, // walk/008.png, se o idle faltar: pernas juntas
    muriJumpStandInFrames: { rise: 2, apex: 0, fall: 6 }, // walk/004, walk/002, walk/008
    muriJumpApexSpeed: 150, // |velocidade vertical| abaixo disto mostra o quadro de ápice
  },
  parallax: {
    farScrollFactor: 0.25,
    midScrollFactor: 0.5,
    // Sóis na camada distante, sorteados a cada partida dentro destas faixas. O espaçamento
    // maior que a tela faz o sol sair de vista e outro surgir mais adiante.
    sun: {
      firstX: [160, 640],
      spacing: [1100, 1600],
      y: [96, 176], // topo da camada; as montanhas começam em 288
      size: [112, 176],
      spinMs: [20000, 45000],
      pulseScale: 0.06,
      pulseMs: [3000, 5000],
    },
  },
  controls: {
    margin: 64,
    buttonSize: 128,
    buttonHitRadius: 72,
    buttonGap: 16,
    pauseSize: 64,
    pauseHitSize: 96,
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
