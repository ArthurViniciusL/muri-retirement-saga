export class Motion {
  public static isReduced(): boolean {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }
}
