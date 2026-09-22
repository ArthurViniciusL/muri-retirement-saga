/**
 * main — ponto de entrada da aplicação.
 *
 * Responsabilidade: instanciar o Phaser.Game a partir do gameConfig e montá-lo no
 * container do index.html. Nenhuma lógica de jogo vive aqui.
 *
 * Referência: System Design §3 (Arquitetura de cenas), §4 (Estrutura de pastas).
 */
import Phaser from 'phaser';
import { gameConfig, logicalWidthFor } from '@/config/gameConfig';
import { zincCss } from '@/config/palette';
import { BootScene } from '@/scenes/BootScene';
import { PreloadScene } from '@/scenes/PreloadScene';
import { MenuScene } from '@/scenes/MenuScene';
import { PhaseSelectScene } from '@/scenes/PhaseSelectScene';
import { Phase1Scene } from '@/scenes/Phase1Scene';
import { Phase2Scene } from '@/scenes/Phase2Scene';
import { Phase3Scene } from '@/scenes/Phase3Scene';
import { PauseScene } from '@/scenes/PauseScene';
import { GameOverScene } from '@/scenes/GameOverScene';

const { render, physics } = gameConfig;

// A resolução interna é a lógica (largura elástica × 576) e o canvas é ampliado por
// CSS sem suavização. Assim texto, HUD e arte saem na mesma escala de pixel, como
// pede o pseudo pixel art, em vez de o RESIZE desenhar vetores na resolução da tela.
const game = new Phaser.Game({
  type: Phaser.AUTO,
  parent: 'game-root',
  backgroundColor: zincCss(50),
  pixelArt: render.pixelArt,
  roundPixels: render.roundPixels,
  antialias: render.antialias,
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: logicalWidthFor(window.innerWidth, window.innerHeight),
    height: render.logicalHeight,
  },
  physics: {
    default: 'arcade',
    arcade: { gravity: { x: 0, y: physics.gravityY }, tileBias: physics.tileBias },
  },
  scene: [BootScene, PreloadScene, MenuScene, PhaseSelectScene, Phase1Scene, Phase2Scene, Phase3Scene, PauseScene, GameOverScene],
});

function syncLogicalWidth(): void {
  const width = logicalWidthFor(window.innerWidth, window.innerHeight);
  if (width !== game.scale.gameSize.width) {
    // O Scale Manager só relê o container no próprio passo; sem isto, o FIT usaria o
    // tamanho de antes da rotação e o canvas sairia cortado.
    game.scale.getParentBounds();
    game.scale.setGameSize(width, render.logicalHeight);
  }
}

window.addEventListener('resize', syncLogicalWidth);
window.addEventListener('orientationchange', () => window.requestAnimationFrame(syncLogicalWidth));
