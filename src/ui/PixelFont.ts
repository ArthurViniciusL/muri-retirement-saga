/**
 * PixelFont — fonte bitmap pixel do jogo, gerada em código.
 *
 * Responsabilidade: desenhar os glifos no mesmo grid do resto da arte e registrá-los
 * no cache de bitmap fonts, um registro por tom da paleta. Texto nunca é renderizado
 * com `this.add.text` em alta resolução por cima da arte (pseudo pixel art).
 *
 * Célula de cada glifo: 11 linhas — 2 de acento para maiúsculas, 7 de corpo
 * (maiúscula), 2 de descendente. O centro da célula coincide com o centro da
 * maiúscula, então `setOrigin(0.5)` centraliza pela altura visual das letras.
 *
 * A fonte Xilosa do convite não foi entregue e não é substituída por uma parecida;
 * esta fonte é o bloco "Atari" do Cordel Arcade, não uma imitação da Xilosa.
 *
 * Referência: `.agents/rules/art-pseudo-pixel-art.md`; guidelines.md §12.
 */
import Phaser from 'phaser';
import { paletteCss, type PaletteTone } from '@/config/palette';

const ACCENT_ROWS = 2;
const BODY_ROWS = 7;
const DESCENDER_ROWS = 2;
const CELL_ROWS = ACCENT_ROWS + BODY_ROWS + DESCENDER_ROWS;
const LETTER_SPACING = 1;
const LINE_SPACING = 1;
const SPACE_WIDTH = 3;

interface Glyph {
  /** Linhas do corpo (7), com `#` para pixel aceso. */
  body: readonly string[];
  /** Linhas abaixo da linha de base (até 2). */
  descender?: readonly string[];
}

const upper: Record<string, Glyph> = {
  A: { body: ['.###.', '#...#', '#...#', '#####', '#...#', '#...#', '#...#'] },
  B: { body: ['####.', '#...#', '#...#', '####.', '#...#', '#...#', '####.'] },
  C: { body: ['.###.', '#...#', '#....', '#....', '#....', '#...#', '.###.'] },
  D: { body: ['####.', '#...#', '#...#', '#...#', '#...#', '#...#', '####.'] },
  E: { body: ['#####', '#....', '#....', '####.', '#....', '#....', '#####'] },
  F: { body: ['#####', '#....', '#....', '####.', '#....', '#....', '#....'] },
  G: { body: ['.###.', '#...#', '#....', '#.###', '#...#', '#...#', '.####'] },
  H: { body: ['#...#', '#...#', '#...#', '#####', '#...#', '#...#', '#...#'] },
  I: { body: ['###', '.#.', '.#.', '.#.', '.#.', '.#.', '###'] },
  J: { body: ['..###', '...#.', '...#.', '...#.', '#..#.', '#..#.', '.##..'] },
  K: { body: ['#...#', '#..#.', '#.#..', '##...', '#.#..', '#..#.', '#...#'] },
  L: { body: ['#....', '#....', '#....', '#....', '#....', '#....', '#####'] },
  M: { body: ['#...#', '##.##', '#.#.#', '#.#.#', '#...#', '#...#', '#...#'] },
  N: { body: ['#...#', '##..#', '#.#.#', '#..##', '#...#', '#...#', '#...#'] },
  O: { body: ['.###.', '#...#', '#...#', '#...#', '#...#', '#...#', '.###.'] },
  P: { body: ['####.', '#...#', '#...#', '####.', '#....', '#....', '#....'] },
  Q: { body: ['.###.', '#...#', '#...#', '#...#', '#.#.#', '#..#.', '.##.#'] },
  R: { body: ['####.', '#...#', '#...#', '####.', '#.#..', '#..#.', '#...#'] },
  S: { body: ['.####', '#....', '#....', '.###.', '....#', '....#', '####.'] },
  T: { body: ['#####', '..#..', '..#..', '..#..', '..#..', '..#..', '..#..'] },
  U: { body: ['#...#', '#...#', '#...#', '#...#', '#...#', '#...#', '.###.'] },
  V: { body: ['#...#', '#...#', '#...#', '#...#', '#...#', '.#.#.', '..#..'] },
  W: { body: ['#...#', '#...#', '#...#', '#.#.#', '#.#.#', '##.##', '#...#'] },
  X: { body: ['#...#', '#...#', '.#.#.', '..#..', '.#.#.', '#...#', '#...#'] },
  Y: { body: ['#...#', '#...#', '.#.#.', '..#..', '..#..', '..#..', '..#..'] },
  Z: { body: ['#####', '....#', '...#.', '..#..', '.#...', '#....', '#####'] },
};

const lower: Record<string, Glyph> = {
  a: { body: ['.....', '.....', '.###.', '....#', '.####', '#...#', '.####'] },
  b: { body: ['#....', '#....', '####.', '#...#', '#...#', '#...#', '####.'] },
  c: { body: ['.....', '.....', '.###.', '#....', '#....', '#...#', '.###.'] },
  d: { body: ['....#', '....#', '.####', '#...#', '#...#', '#...#', '.####'] },
  e: { body: ['.....', '.....', '.###.', '#...#', '#####', '#....', '.###.'] },
  f: { body: ['..##', '.#..', '.#..', '###.', '.#..', '.#..', '.#..'] },
  g: {
    body: ['.....', '.....', '.####', '#...#', '#...#', '#...#', '.####'],
    descender: ['....#', '.###.'],
  },
  h: { body: ['#....', '#....', '####.', '#...#', '#...#', '#...#', '#...#'] },
  i: { body: ['.#.', '...', '##.', '.#.', '.#.', '.#.', '###'] },
  j: { body: ['..#', '...', '.##', '..#', '..#', '..#', '..#'], descender: ['#.#', '.#.'] },
  k: { body: ['#...', '#...', '#..#', '#.#.', '##..', '#.#.', '#..#'] },
  l: { body: ['##.', '.#.', '.#.', '.#.', '.#.', '.#.', '###'] },
  m: { body: ['.....', '.....', '##.#.', '#.#.#', '#.#.#', '#.#.#', '#...#'] },
  n: { body: ['.....', '.....', '####.', '#...#', '#...#', '#...#', '#...#'] },
  o: { body: ['.....', '.....', '.###.', '#...#', '#...#', '#...#', '.###.'] },
  p: {
    body: ['.....', '.....', '####.', '#...#', '#...#', '#...#', '####.'],
    descender: ['#....', '#....'],
  },
  q: {
    body: ['.....', '.....', '.####', '#...#', '#...#', '#...#', '.####'],
    descender: ['....#', '....#'],
  },
  r: { body: ['.....', '.....', '#.##.', '##..#', '#....', '#....', '#....'] },
  s: { body: ['.....', '.....', '.####', '#....', '.###.', '....#', '####.'] },
  t: { body: ['.#..', '.#..', '###.', '.#..', '.#..', '.#..', '..##'] },
  u: { body: ['.....', '.....', '#...#', '#...#', '#...#', '#...#', '.####'] },
  v: { body: ['.....', '.....', '#...#', '#...#', '#...#', '.#.#.', '..#..'] },
  w: { body: ['.....', '.....', '#...#', '#...#', '#.#.#', '#.#.#', '.#.#.'] },
  x: { body: ['.....', '.....', '#...#', '.#.#.', '..#..', '.#.#.', '#...#'] },
  y: {
    body: ['.....', '.....', '#...#', '#...#', '#...#', '#...#', '.####'],
    descender: ['....#', '.###.'],
  },
  z: { body: ['.....', '.....', '#####', '...#.', '..#..', '.#...', '#####'] },
};

const digitsAndPunctuation: Record<string, Glyph> = {
  '0': { body: ['.###.', '#...#', '#..##', '#.#.#', '##..#', '#...#', '.###.'] },
  '1': { body: ['.#.', '##.', '.#.', '.#.', '.#.', '.#.', '###'] },
  '2': { body: ['.###.', '#...#', '....#', '...#.', '..#..', '.#...', '#####'] },
  '3': { body: ['####.', '....#', '....#', '.###.', '....#', '....#', '####.'] },
  '4': { body: ['...#.', '..##.', '.#.#.', '#..#.', '#####', '...#.', '...#.'] },
  '5': { body: ['#####', '#....', '####.', '....#', '....#', '#...#', '.###.'] },
  '6': { body: ['.###.', '#....', '#....', '####.', '#...#', '#...#', '.###.'] },
  '7': { body: ['#####', '....#', '...#.', '..#..', '.#...', '.#...', '.#...'] },
  '8': { body: ['.###.', '#...#', '#...#', '.###.', '#...#', '#...#', '.###.'] },
  '9': { body: ['.###.', '#...#', '#...#', '.####', '....#', '....#', '.###.'] },
  '.': { body: ['.', '.', '.', '.', '.', '.', '#'] },
  ',': { body: ['..', '..', '..', '..', '..', '.#', '.#'], descender: ['#.'] },
  '!': { body: ['#', '#', '#', '#', '#', '.', '#'] },
  '?': { body: ['.###.', '#...#', '....#', '...#.', '..#..', '.....', '..#..'] },
  ':': { body: ['.', '.', '#', '.', '.', '.', '#'] },
  ';': { body: ['..', '..', '.#', '..', '..', '.#', '.#'], descender: ['#.'] },
  '-': { body: ['...', '...', '...', '###', '...', '...', '...'] },
  "'": { body: ['#', '#', '.', '.', '.', '.', '.'] },
  '"': { body: ['#.#', '#.#', '...', '...', '...', '...', '...'] },
};

type AccentKind = 'acute' | 'grave' | 'circumflex' | 'tilde';

const accents: Record<AccentKind, readonly string[]> = {
  acute: ['..#', '.#.'],
  grave: ['#..', '.#.'],
  circumflex: ['.#.', '#.#'],
  tilde: ['.#.#', '#.#.'],
};

const cedilla: readonly string[] = ['..#..', '.##..'];

/** Letras acentuadas do português: [letra base, acento]. */
const accented: Record<string, [string, AccentKind]> = {
  á: ['a', 'acute'], à: ['a', 'grave'], â: ['a', 'circumflex'], ã: ['a', 'tilde'],
  é: ['e', 'acute'], ê: ['e', 'circumflex'], í: ['ı', 'acute'],
  ó: ['o', 'acute'], ô: ['o', 'circumflex'], õ: ['o', 'tilde'], ú: ['u', 'acute'],
  Á: ['A', 'acute'], À: ['A', 'grave'], Â: ['A', 'circumflex'], Ã: ['A', 'tilde'],
  É: ['E', 'acute'], Ê: ['E', 'circumflex'], Í: ['I', 'acute'],
  Ó: ['O', 'acute'], Ô: ['O', 'circumflex'], Õ: ['O', 'tilde'], Ú: ['U', 'acute'],
};

/** Um glifo já montado na célula completa de 11 linhas. */
type Cell = string[];

function cellWidth(rows: readonly string[]): number {
  return rows[0]?.length ?? 0;
}

function emptyRow(width: number): string {
  return '.'.repeat(width);
}

function stamp(row: string, pattern: string, offset: number): string {
  const chars = row.split('');
  pattern.split('').forEach((pixel, i) => {
    if (pixel === '#' && offset + i >= 0 && offset + i < chars.length) {
      chars[offset + i] = '#';
    }
  });
  return chars.join('');
}

function toCell(glyph: Glyph): Cell {
  const width = cellWidth(glyph.body);
  const descender = glyph.descender ?? [];
  return [
    ...Array.from({ length: ACCENT_ROWS }, () => emptyRow(width)),
    ...glyph.body,
    ...Array.from({ length: DESCENDER_ROWS }, (_, i) => descender[i] ?? emptyRow(width)),
  ];
}

/** Maiúscula: acento na faixa acima do corpo. Minúscula: nas 2 linhas vazias do corpo. */
function accentRowFor(letter: string): number {
  const isUpperCase = letter === letter.toUpperCase();
  return isUpperCase ? 0 : ACCENT_ROWS;
}

function withAccent(base: Cell, accent: readonly string[], firstRow: number): Cell {
  const width = cellWidth(base);
  const offset = Math.floor((width - cellWidth(accent)) / 2);
  const cell = [...base];
  accent.forEach((pattern, i) => {
    const row = firstRow + i;
    cell[row] = stamp(cell[row] ?? emptyRow(width), pattern, offset);
  });
  return cell;
}

function withCedilla(base: Cell): Cell {
  const cell = [...base];
  cedilla.forEach((pattern, i) => {
    const row = ACCENT_ROWS + BODY_ROWS + i;
    cell[row] = stamp(cell[row] ?? '', pattern, 0);
  });
  return cell;
}

function buildCells(): Map<string, Cell> {
  const cells = new Map<string, Cell>();
  for (const [char, glyph] of Object.entries({ ...upper, ...lower, ...digitsAndPunctuation })) {
    cells.set(char, toCell(glyph));
  }

  // "ı" (i sem pingo) só existe como base para o "í".
  const dotlessI = toCell({ body: ['...', '...', '##.', '.#.', '.#.', '.#.', '###'] });
  const bases = new Map(cells).set('ı', dotlessI);

  for (const [char, [baseChar, kind]] of Object.entries(accented)) {
    const base = bases.get(baseChar);
    if (base) {
      cells.set(char, withAccent(base, accents[kind], accentRowFor(baseChar)));
    }
  }

  for (const [char, baseChar] of [['ç', 'c'], ['Ç', 'C']] as const) {
    const base = cells.get(baseChar);
    if (base) {
      cells.set(char, withCedilla(base));
    }
  }
  return cells;
}

interface CharacterData extends Phaser.Types.GameObjects.BitmapText.BitmapFontCharacterData {
  xAdvance: number;
}

function characterData(x: number, width: number, textureWidth: number): CharacterData {
  return {
    x,
    y: 0,
    width,
    height: CELL_ROWS,
    centerX: Math.floor(width / 2),
    centerY: Math.floor(CELL_ROWS / 2),
    xOffset: 0,
    yOffset: 0,
    xAdvance: width + LETTER_SPACING,
    data: {},
    kerning: {},
    u0: x / textureWidth,
    v0: 0,
    u1: (x + width) / textureWidth,
    v1: 1,
  };
}

/** O espaço não tem pixel: só avança o cursor. */
const spaceCharacter: CharacterData = {
  ...characterData(0, 0, 1),
  height: 0,
  centerY: 0,
  v1: 0,
  xAdvance: SPACE_WIDTH + LETTER_SPACING,
};

/**
 * Pinta os glifos lado a lado numa faixa de 1 célula de altura, com 1 px de folga
 * entre eles, e devolve onde cada um ficou.
 */
function paintGlyphStrip(
  context: CanvasRenderingContext2D,
  cells: ReadonlyMap<string, Cell>,
  textureWidth: number,
): Record<number, CharacterData> {
  const chars: Record<number, CharacterData> = {};
  let x = 0;
  for (const [char, cell] of cells) {
    cell.forEach((row, y) => {
      [...row].forEach((pixel, column) => {
        if (pixel === '#') {
          context.fillRect(x + column, y, 1, 1);
        }
      });
    });
    const width = cellWidth(cell);
    chars[char.charCodeAt(0)] = characterData(x, width, textureWidth);
    x += width + 1;
  }
  chars[' '.charCodeAt(0)] = spaceCharacter;
  return chars;
}


export class PixelFont {
  public static keyFor(tone: PaletteTone): string {
    return `pixel-${tone}`;
  }

  /** Tamanho do BitmapText para uma escala inteira de pixel de arte. */
  public static sizeFor(scale: number): number {
    return CELL_ROWS * scale;
  }

  /**
   * Área ocupada só pelo corpo das letras, sem a faixa de acento nem a de
   * descendente — o retângulo que o olho lê como "o texto".
   */
  public static letterBodyBounds(text: Phaser.GameObjects.BitmapText): Phaser.Geom.Rectangle {
    const scale = text.fontSize / CELL_ROWS;
    const bounds = text.getBounds();
    return new Phaser.Geom.Rectangle(bounds.x, bounds.y + ACCENT_ROWS * scale, bounds.width, BODY_ROWS * scale);
  }

  /**
   * Gera uma textura e um registro de bitmap font por tom. Um registro por tom em
   * vez de `setTint`, porque o renderizador canvas ignora tint.
   */
  public static register(scene: Phaser.Scene, tones: readonly PaletteTone[]): void {
    const cells = buildCells();
    const textureWidth = [...cells.values()].reduce((sum, cell) => sum + cellWidth(cell) + 1, 0);

    for (const tone of tones) {
      const key = PixelFont.keyFor(tone);
      if (scene.cache.bitmapFont.exists(key)) {
        continue;
      }

      const texture = scene.textures.createCanvas(key, textureWidth, CELL_ROWS);
      if (!texture) {
        throw new Error(`PixelFont: não foi possível criar a textura "${key}".`);
      }
      const context = texture.getContext();
      context.fillStyle = paletteCss(tone);
      const chars = paintGlyphStrip(context, cells, textureWidth);
      texture.refresh();

      const data: Phaser.Types.GameObjects.BitmapText.BitmapFontData = {
        font: key,
        size: CELL_ROWS,
        lineHeight: CELL_ROWS + LINE_SPACING,
        retroFont: false,
        chars,
      };
      scene.cache.bitmapFont.add(key, { data, texture: key, frame: null });
    }
  }
}
