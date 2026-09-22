/**
 * Woodcut — primitivas de desenho em estilo xilogravura ("Cordel Arcade").
 *
 * Responsabilidade: gerar a geometria entalhada usada em telas e molduras — contorno
 * com barrigas e cantos que passam do ponto, marcas de goiva em folha dentro de massas
 * pretas e hachura a 45° para sombra sobre o papel. Sem gradiente, sem glow, sem
 * transparência: tudo é polígono cheio num único tom da paleta.
 *
 * Toda irregularidade vem de um gerador com semente fixa, então a mesma peça sai
 * idêntica a cada carga e a cada redimensionamento.
 *
 * Referência: guidelines.md §3, §13, §15–§17;
 * `.agents/rules/art-linework-and-texture.md`.
 */
import Phaser from 'phaser';

export interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface Point {
  x: number;
  y: number;
}

export interface CarveOptions {
  /** Amplitude máxima da barriga de cada lado, em px de arte. */
  belly: number;
  /** Deslocamento máximo de cada ponto em relação ao ideal (§8: pequeno). */
  jitter: number;
  /** Distância aproximada entre pontos ao longo de um lado. */
  step: number;
  /** Quantos cantos ganham um corte que passa do ponto (§8: 2 ou 3, nunca todos). */
  overshootCorners: number;
  /** Comprimento do corte que passa do ponto. */
  overshoot: number;
}

export interface HatchOptions {
  area: Rect;
  /** Distância entre as linhas (§9: abaixo disso a hachura entope e vira cinza). */
  spacing: number;
  thickness: number;
  color: number;
}

interface LeafShape {
  center: Point;
  length: number;
  width: number;
  angle: number;
  /** Curvatura do eixo da folha, em px; positiva ou negativa. */
  bow: number;
}

export interface GougeOptions {
  count: number;
  minLength: number;
  maxLength: number;
  /** Largura máxima da folha, independente do comprimento (§9.1). */
  width: number;
  /** Áreas que não recebem marca (ex.: letras entalhadas). */
  avoid: readonly Rect[];
  /** Espaço mínimo entre marcas, para que continuem separadas. */
  minGap: number;
}

/**
 * Perfil de largura da marca de goiva, medido no `cactus_004.svg` (§9.1), normalizado
 * pela largura máxima: fecha rápido nas pontas e segura a barriga no meio.
 */
const GOUGE_PROFILE: readonly (readonly [number, number])[] = [
  [0, 0],
  [0.05, 0.14],
  [0.25, 0.79],
  [0.5, 1],
  [0.75, 0.93],
  [0.95, 0.41],
  [1, 0],
];

function profileAt(t: number): number {
  for (let i = 1; i < GOUGE_PROFILE.length; i += 1) {
    const [t1, w1] = GOUGE_PROFILE[i] ?? [1, 0];
    const [t0, w0] = GOUGE_PROFILE[i - 1] ?? [0, 0];
    if (t <= t1) {
      return w0 + ((w1 - w0) * (t - t0)) / (t1 - t0);
    }
  }
  return 0;
}

function biasToEnds(t: number): number {
  return 0.5 + Math.sign(t - 0.5) * Math.pow(Math.abs(t - 0.5) * 2, 0.6) * 0.5;
}

function insideAny(point: Point, rects: readonly Rect[], margin: number): boolean {
  return rects.some(
    (r) =>
      point.x > r.x - margin &&
      point.x < r.x + r.width + margin &&
      point.y > r.y - margin &&
      point.y < r.y + r.height + margin,
  );
}

export class Woodcut {
  private readonly rng: Phaser.Math.RandomDataGenerator;

  public constructor(seed: string) {
    this.rng = new Phaser.Math.RandomDataGenerator([seed]);
  }

  /**
   * Contorno entalhado de um retângulo: lados com barriga fora do centro, pontos
   * levemente deslocados e alguns cantos com um corte que passa da junção.
   */
  public carvedRect(rect: Rect, options: CarveOptions): Point[] {
    const corners: Point[] = [
      { x: rect.x, y: rect.y },
      { x: rect.x + rect.width, y: rect.y },
      { x: rect.x + rect.width, y: rect.y + rect.height },
      { x: rect.x, y: rect.y + rect.height },
    ];
    const overshootSides = new Set(
      this.rng.shuffle([0, 1, 2, 3]).slice(0, Math.min(3, options.overshootCorners)),
    );

    const points = corners.flatMap((start, side) => {
      const end = corners[(side + 1) % corners.length] ?? start;
      return this.carveSide(start, end, options, overshootSides.has(side));
    });
    return points.map((p) => ({ x: Math.round(p.x), y: Math.round(p.y) }));
  }

  /** Um lado do contorno, do canto `start` até antes do canto `end`. */
  private carveSide(start: Point, end: Point, options: CarveOptions, overshootsStart: boolean): Point[] {
    const dx = end.x - start.x;
    const dy = end.y - start.y;
    const length = Math.hypot(dx, dy);
    // Normal para fora do retângulo (contorno em sentido horário na tela).
    const normal = { x: dy / length, y: -dx / length };
    const belly = this.rng.realInRange(0.4, 1) * options.belly * (this.rng.frac() < 0.8 ? 1 : -1);
    const apexSkew = this.rng.realInRange(0.7, 1.4); // tira o ápice da barriga do centro
    const segments = Math.max(2, Math.round(length / options.step));

    const points: Point[] = [];
    if (overshootsStart) {
      // O corte anterior passou da junção: um espigão fino além do canto.
      points.push(
        { x: start.x - (dx / length) * options.overshoot, y: start.y - (dy / length) * options.overshoot },
        { x: start.x + normal.x, y: start.y + normal.y },
      );
    }
    points.push(this.jittered(start, options.jitter * 0.5));

    for (let i = 1; i < segments; i += 1) {
      const t = i / segments;
      const bulge = Math.sin(Math.PI * Math.pow(t, apexSkew)) * belly;
      const onSide = { x: start.x + dx * t + normal.x * bulge, y: start.y + dy * t + normal.y * bulge };
      points.push(this.jittered(onSide, options.jitter));
    }
    return points;
  }

  /**
   * Marcas de goiva (§9.1): folhas finas espalhadas dentro da massa preta, a maioria
   * alinhada ao eixo longo, cerca de uma em seis cortando atravessada.
   */
  public gougeMarks(mass: Rect, options: GougeOptions): Point[][] {
    const marks: Point[][] = [];
    const centers: Point[] = [];
    const maxAttempts = options.count * 60;

    for (let attempt = 0; attempt < maxAttempts && marks.length < options.count; attempt += 1) {
      const center = this.randomGougeCenter(mass, options);
      const blocked =
        insideAny(center, options.avoid, options.maxLength * 0.6) ||
        centers.some((c) => Math.hypot(c.x - center.x, c.y - center.y) < options.minGap);
      if (blocked) {
        continue;
      }

      const length = this.randomGougeLength(options);
      centers.push(center);
      marks.push(
        this.leaf({
          center,
          length,
          width: options.width,
          angle: this.randomGougeAngle(),
          bow: this.rng.realInRange(-0.05, 0.05) * length,
        }),
      );
    }
    return marks;
  }

  /** Hachura a 45° ("/") recortada num retângulo, para sombra sobre o papel (§9). */
  public static hatch(graphics: Phaser.GameObjects.Graphics, { area, spacing, thickness, color }: HatchOptions): void {
    graphics.lineStyle(thickness, color, 1);
    for (let d = -area.height; d < area.width; d += spacing) {
      const tStart = Math.max(0, -d);
      const tEnd = Math.min(area.height, area.width - d);
      if (tEnd <= tStart) {
        continue;
      }
      graphics.lineBetween(
        Math.round(area.x + d + tStart),
        Math.round(area.y + area.height - tStart),
        Math.round(area.x + d + tEnd),
        Math.round(area.y + area.height - tEnd),
      );
    }
  }

  private randomGougeCenter(mass: Rect, options: GougeOptions): Point {
    const inset = options.maxLength * 0.6;
    return {
      // Viés para as pontas: a massa livre de letras recebe mais marcas (§9.1).
      x: mass.x + inset + (mass.width - inset * 2) * biasToEnds(this.rng.frac()),
      y: this.rng.realInRange(mass.y + options.width * 2, mass.y + mass.height - options.width * 2),
    };
  }

  /** A maioria das marcas fica perto do comprimento típico; algumas vão aos extremos. */
  private randomGougeLength({ minLength, maxLength }: GougeOptions): number {
    return this.rng.frac() < 0.7
      ? this.rng.realInRange(minLength * 1.6, minLength * 2.6)
      : this.rng.realInRange(minLength, maxLength);
  }

  /** Quase todas seguem o eixo longo; cerca de uma em seis corta atravessada (§9.1). */
  private randomGougeAngle(): number {
    const crossesTheGrain = this.rng.frac() < 1 / 6;
    const degrees = crossesTheGrain
      ? this.rng.realInRange(50, 90) * this.rng.sign()
      : this.rng.realInRange(-28, 28);
    return Phaser.Math.DegToRad(degrees);
  }

  private leaf({ center, length, width, angle, bow }: LeafShape): Point[] {
    const samples = 10;
    const upperSide: Point[] = [];
    const lowerSide: Point[] = [];
    for (let i = 0; i <= samples; i += 1) {
      const t = i / samples;
      const along = (t - 0.5) * length;
      const spine = Math.sin(Math.PI * t) * bow;
      const half = (profileAt(t) * width) / 2;
      upperSide.push({ x: along, y: spine - half });
      lowerSide.push({ x: along, y: spine + half });
    }
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    return [...upperSide, ...lowerSide.reverse()].map((p) => ({
      x: center.x + p.x * cos - p.y * sin,
      y: center.y + p.x * sin + p.y * cos,
    }));
  }

  private jittered(point: Point, amount: number): Point {
    return {
      x: point.x + this.rng.realInRange(-amount, amount),
      y: point.y + this.rng.realInRange(-amount, amount),
    };
  }
}
