/**
 * TitlePlate — matriz de xilogravura com o título do jogo.
 *
 * Responsabilidade: montar a peça da capa de cordel — massa preta de contorno
 * entalhado, nome e subtítulo cavados em papel, marcas de goiva ao redor das letras e
 * a sombra hachurada que cai sobre o papel. A sombra fica fora do container, para a
 * entrada poder deslizá-la por baixo da matriz.
 *
 * O container é centrado na placa, para que o carimbo escale a peça a partir do meio.
 *
 * Referência: guidelines.md §13–§16;
 * `.agents/rules/art-linework-and-texture.md`.
 */
import Phaser from 'phaser';
import { palette } from '@/config/palette';
import { PixelFont } from '@/ui/PixelFont';
import { Woodcut, type Rect } from '@/ui/Woodcut';

const WIDTH = 736;
const HEIGHT = 192;
const SHADOW_OFFSET = 12;
const NAME_SCALE = 12;
const SUBTITLE_SCALE = 4;
const NAME_CENTER_Y = 70; // a partir do topo da placa
const SUBTITLE_CENTER_Y = 148;

const HATCH_SPACING = 9;
const HATCH_THICKNESS = 2;

const CARVE = { belly: 4, jitter: 1.2, step: 46, overshootCorners: 2, overshoot: 7 } as const;
const GOUGES = { count: 22, minLength: 10, maxLength: 40, width: 5, minGap: 30 } as const;

export interface TitlePlateOptions {
  centerX: number;
  top: number;
  name: string;
  subtitle: string;
}

export class TitlePlate extends Phaser.GameObjects.Container {
  public static readonly width = WIDTH;
  public static readonly height = HEIGHT;
  /** Quanto a sombra se desloca da placa, para a direita e para baixo. */
  public static readonly shadowOffset = SHADOW_OFFSET;

  public readonly shadow: Phaser.GameObjects.Graphics;

  public constructor(scene: Phaser.Scene, { centerX, top, name, subtitle }: TitlePlateOptions) {
    super(scene, centerX, top + HEIGHT / 2);
    const rect: Rect = { x: centerX - WIDTH / 2, y: top, width: WIDTH, height: HEIGHT };

    this.shadow = scene.add.graphics();
    Woodcut.hatch(this.shadow, {
      area: { x: rect.x + SHADOW_OFFSET, y: rect.y + SHADOW_OFFSET, width: WIDTH + 2, height: HEIGHT + 2 },
      spacing: HATCH_SPACING,
      thickness: HATCH_THICKNESS,
      color: palette.sertao,
    });

    const carver = new Woodcut('muri-plate');
    const mass = scene.make.graphics({}, false);
    mass.fillStyle(palette.ink, 1).fillPoints(carver.carvedRect(rect, CARVE), true);

    const nameText = this.makeTitleText(name, NAME_SCALE, rect.y + NAME_CENTER_Y);
    const subtitleText = this.makeTitleText(subtitle, SUBTITLE_SCALE, rect.y + SUBTITLE_CENTER_Y);

    const gouges = scene.make.graphics({}, false);
    gouges.fillStyle(palette.bone, 1);
    carver
      .gougeMarks(rect, {
        ...GOUGES,
        avoid: [PixelFont.letterBodyBounds(nameText), PixelFont.letterBodyBounds(subtitleText)],
      })
      .forEach((mark) => gouges.fillPoints(mark, true));

    // Tudo foi desenhado em coordenadas de tela; recentra no container. A ordem põe
    // as goivadas entre a massa e as letras, então nunca cobrem o título.
    for (const part of [mass, gouges, nameText, subtitleText]) {
      part.setPosition(part.x - this.x, part.y - this.y);
    }
    this.add([mass, gouges, nameText, subtitleText]);
    scene.add.existing(this);
  }

  /** Texto cavado em papel, centrado em x na placa e em `centerY` na tela. */
  private makeTitleText(text: string, scale: number, centerY: number): Phaser.GameObjects.BitmapText {
    return this.scene.make
      .bitmapText({ font: PixelFont.keyFor('bone'), text: text.toUpperCase(), size: PixelFont.sizeFor(scale) }, false)
      .setOrigin(0.5)
      .setPosition(this.x, centerY);
  }
}
