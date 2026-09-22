import Phaser from 'phaser';
import { gameConfig } from '@/config/gameConfig';
import { textureKeys } from '@/systems/PlaceholderTextures';

export const muriAnimationKeys = {
  idle: 'muri_idle',
  walk: 'muri_walk',
  crouch: 'muri_crouch',
  jump: 'muri_jump',
} as const;

export type JumpPhase = 'rise' | 'apex' | 'fall';

const JUMP_PHASES: readonly JumpPhase[] = ['rise', 'apex', 'fall'];

export const muriJumpTextureKey = (phase: JumpPhase): string => `${muriAnimationKeys.jump}_${phase}`;

type Anchor = 'head' | 'box';

interface Frame {
  key: string;
  source: string;
  url: string;
  jpeg: boolean;
}

interface Drawing {
  image: HTMLCanvasElement;
  anchor: number;
}

const ANIMATIONS: readonly { key: string; folder: string; fps: number; anchor: Anchor; still?: true }[] = [
  { key: muriAnimationKeys.idle, folder: 'stoped', fps: gameConfig.animation.muriIdleFps, anchor: 'head' },
  { key: muriAnimationKeys.walk, folder: 'walk', fps: gameConfig.animation.muriWalkFps, anchor: 'head' },
  { key: muriAnimationKeys.crouch, folder: 'crouch', fps: gameConfig.animation.muriCrouchFps, anchor: 'box' },
  { key: muriAnimationKeys.jump, folder: 'jump', fps: 0, anchor: 'head', still: true },
];

const HEAD_ROWS = 0.28;
const OPAQUE = 127;
const JPEG_BACKGROUND_LUMA = 235;

const frameUrls = import.meta.glob<string>('../assets/sprites/muri/*/*.{png,jpg}', {
  eager: true,
  query: '?url',
  import: 'default',
});

const framesOf = (animation: string): Frame[] => {
  const folder = ANIMATIONS.find(({ key }) => key === animation)?.folder;
  return Object.keys(frameUrls)
    .sort()
    .filter((path) => folder !== undefined && path.includes(`/${folder}/`))
    .map((path) => {
      const key = `${animation}_${path.slice(path.lastIndexOf('/') + 1, path.lastIndexOf('.'))}`;
      return { key, source: `${key}_source`, url: frameUrls[path] ?? '', jpeg: path.endsWith('.jpg') };
    });
};

export class MuriAnimations {
  public static preload(loader: Phaser.Loader.LoaderPlugin): void {
    ANIMATIONS.forEach(({ key }) => framesOf(key).forEach(({ source, url }) => loader.image(source, url)));
  }

  // Os desenhos têm larguras diferentes; cada um é redesenhado numa tela comum, com a
  // âncora no centro e os pés na base, para o Muri não tremer entre quadros.
  public static register(scene: Phaser.Scene): void {
    const drawings = new Map<string, Drawing>();
    for (const { key, anchor } of ANIMATIONS) {
      for (const frame of framesOf(key)) {
        const image = scene.textures.exists(frame.source) ? scene.textures.get(frame.source).getSourceImage() : null;
        const canvas = image instanceof HTMLImageElement ? MuriAnimations.toCanvas(image, frame.jpeg) : null;
        if (canvas) {
          drawings.set(frame.key, { image: canvas, anchor: MuriAnimations.anchorOf(canvas, anchor) });
        }
      }
    }
    if (drawings.size === 0) {
      return;
    }

    const reach = Math.max(...[...drawings.values()].map(({ image, anchor }) => Math.max(anchor, image.width - anchor)));
    const width = Math.ceil(reach) * 2;
    const height = Math.max(...[...drawings.values()].map(({ image }) => image.height));
    drawings.forEach((drawing, key) => MuriAnimations.compose(scene, key, drawing, width, height));

    for (const { key, fps, still } of ANIMATIONS) {
      const frames = framesOf(key).filter((frame) => drawings.has(frame.key));
      if (!still && frames.length > 0 && !scene.anims.exists(key)) {
        scene.anims.create({ key, frames: frames.map((frame) => ({ key: frame.key })), frameRate: fps, repeat: -1 });
      }
    }

    // Quadro parado usado pelo gerador de placeholder: o primeiro do idle, ou um quadro
    // da caminhada se o idle faltar.
    const loaded = (animation: string): Frame[] => framesOf(animation).filter((frame) => drawings.has(frame.key));
    const walk = loaded(muriAnimationKeys.walk);
    const stand = loaded(muriAnimationKeys.idle)[0] ?? walk[gameConfig.animation.muriStandInFrame] ?? walk[0];
    const standDrawing = stand ? drawings.get(stand.key) : undefined;
    if (standDrawing && !scene.textures.exists(textureKeys.muri)) {
      MuriAnimations.compose(scene, textureKeys.muri, standDrawing, width, height);
    }

    // Enquanto jump/001–003 (subida, ápice, queda) não existem, cada fase usa um quadro
    // da caminhada.
    const jump = loaded(muriAnimationKeys.jump);
    JUMP_PHASES.forEach((phase, index) => {
      const frame = jump[index] ?? walk[gameConfig.animation.muriJumpStandInFrames[phase]] ?? stand;
      const drawing = frame ? drawings.get(frame.key) : undefined;
      const key = muriJumpTextureKey(phase);
      if (drawing && !scene.textures.exists(key)) {
        MuriAnimations.compose(scene, key, drawing, width, height);
      }
    });
  }

  private static compose(scene: Phaser.Scene, key: string, { image, anchor }: Drawing, width: number, height: number): void {
    const texture = scene.textures.createCanvas(key, width, height);
    if (!texture) {
      return;
    }
    texture.context.drawImage(image, Math.round(width / 2 - anchor), height - image.height);
    texture.refresh();
    texture.setFilter(Phaser.Textures.FilterMode.LINEAR);
  }

  // JPEG não tem transparência: o branco ligado à borda vira fundo, e o que o traço
  // fecha (capacete, colete) continua opaco.
  private static toCanvas(image: HTMLImageElement, jpeg: boolean): HTMLCanvasElement | null {
    const canvas = document.createElement('canvas');
    canvas.width = image.width;
    canvas.height = image.height;
    const context = canvas.getContext('2d');
    if (!context) {
      return null;
    }
    context.drawImage(image, 0, 0);
    if (jpeg) {
      const pixels = context.getImageData(0, 0, canvas.width, canvas.height);
      MuriAnimations.clearBackground(pixels);
      context.putImageData(pixels, 0, 0);
      return MuriAnimations.crop(canvas, pixels);
    }
    return canvas;
  }

  private static clearBackground({ data, width, height }: ImageData): void {
    const light = (i: number): boolean =>
      0.299 * (data[i * 4] ?? 0) + 0.587 * (data[i * 4 + 1] ?? 0) + 0.114 * (data[i * 4 + 2] ?? 0) >= JPEG_BACKGROUND_LUMA;
    const seen = new Uint8Array(width * height);
    const stack: number[] = [];
    for (let x = 0; x < width; x += 1) {
      stack.push(x, (height - 1) * width + x);
    }
    for (let y = 0; y < height; y += 1) {
      stack.push(y * width, y * width + width - 1);
    }
    while (stack.length > 0) {
      const i = stack.pop() ?? 0;
      if (seen[i] || !light(i)) {
        continue;
      }
      seen[i] = 1;
      data[i * 4 + 3] = 0;
      const x = i % width;
      if (x > 0) {
        stack.push(i - 1);
      }
      if (x < width - 1) {
        stack.push(i + 1);
      }
      if (i >= width) {
        stack.push(i - width);
      }
      if (i < width * (height - 1)) {
        stack.push(i + width);
      }
    }
  }

  private static crop(canvas: HTMLCanvasElement, { data, width, height }: ImageData): HTMLCanvasElement | null {
    let left = width;
    let right = -1;
    let top = height;
    let bottom = -1;
    for (let i = 0; i < width * height; i += 1) {
      if ((data[i * 4 + 3] ?? 0) > OPAQUE) {
        const x = i % width;
        const y = Math.floor(i / width);
        left = Math.min(left, x);
        right = Math.max(right, x);
        top = Math.min(top, y);
        bottom = Math.max(bottom, y);
      }
    }
    if (right < 0) {
      return null;
    }
    const cropped = document.createElement('canvas');
    cropped.width = right - left + 1;
    cropped.height = bottom - top + 1;
    cropped.getContext('2d')?.drawImage(canvas, -left, -top);
    return cropped;
  }

  private static anchorOf(image: HTMLCanvasElement, anchor: Anchor): number {
    const context = image.getContext('2d');
    if (!context) {
      return image.width / 2;
    }
    const rows = anchor === 'head' ? Math.ceil(image.height * HEAD_ROWS) : image.height;
    const { data } = context.getImageData(0, 0, image.width, rows);
    const xs: number[] = [];
    for (let i = 3; i < data.length; i += 4) {
      if ((data[i] ?? 0) > OPAQUE) {
        xs.push(((i - 3) / 4) % image.width);
      }
    }
    if (xs.length === 0) {
      return image.width / 2;
    }
    return anchor === 'head'
      ? xs.reduce((sum, x) => sum + x, 0) / xs.length
      : (Math.min(...xs) + Math.max(...xs) + 1) / 2;
  }
}
