import type Phaser from 'phaser';
import { zinc } from '@/config/palette';
import { PixelFont } from '@/ui/PixelFont';
import { SeraButton } from '@/ui/SeraButton';
import { Woodcut } from '@/ui/Woodcut';

export interface OverlayAction {
  label: string;
  onPress: () => void;
}

const TITLE_SCALE = 6;
const GAP_TITLE_TO_BUTTONS = 48;
const GAP_BETWEEN_BUTTONS = 24;
const FRAME = 32;
const HATCH = { spacing: 9, thickness: 2 } as const;

export class OverlayPanel {
  // Papel opaco: a paleta não admite véu translúcido sobre a fase congelada.
  public static build(scene: Phaser.Scene, title: string, actions: readonly OverlayAction[]): void {
    const { width, height } = scene.scale.gameSize;
    const paper = scene.add.graphics();
    paper.fillStyle(zinc[50], 1).fillRect(0, 0, width, height);
    const frames = [
      { x: 0, y: 0, width, height: FRAME },
      { x: 0, y: height - FRAME, width, height: FRAME },
      { x: 0, y: FRAME, width: FRAME, height: height - FRAME * 2 },
      { x: width - FRAME, y: FRAME, width: FRAME, height: height - FRAME * 2 },
    ];
    frames.forEach((area) => Woodcut.hatch(paper, { area, ...HATCH, color: zinc[500] }));

    const centerX = Math.round(width / 2);
    const titleText = scene.add
      .bitmapText(centerX, 0, PixelFont.keyFor(900), title, PixelFont.sizeFor(TITLE_SCALE))
      .setOrigin(0.5, 0);
    const buttonsHeight = actions.length * SeraButton.height + (actions.length - 1) * GAP_BETWEEN_BUTTONS;
    const top = Math.round((height - titleText.height - GAP_TITLE_TO_BUTTONS - buttonsHeight) / 2);
    titleText.setY(top);

    actions.forEach(({ label, onPress }, index) => {
      const buttonTop = top + titleText.height + GAP_TITLE_TO_BUTTONS + index * (SeraButton.height + GAP_BETWEEN_BUTTONS);
      new SeraButton(scene, { centerX, top: Math.round(buttonTop), label, onPress });
    });
  }
}
