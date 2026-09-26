import { gameConfig } from '@/config/gameConfig';

export class HealthSystem {
  private hearts: number = gameConfig.combat.maxHearts;
  private readonly lastHitAt = new Map<string, number>();

  public get remaining(): number {
    return this.hearts;
  }

  /**
   * O cooldown é por fonte de dano: dois espinhos diferentes no mesmo instante
   * custam dois corações, o mesmo espinho não.
   */
  public loseHeart(source: string, now: number): boolean {
    const last = this.lastHitAt.get(source);
    if (last !== undefined && now - last < gameConfig.combat.damageCooldownMs) {
      return false;
    }
    this.lastHitAt.set(source, now);
    this.hearts = Math.max(0, this.hearts - 1);
    return true;
  }
}
