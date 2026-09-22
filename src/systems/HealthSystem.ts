/**
 * HealthSystem — vida do jogador.
 *
 * Responsabilidade: controlar os 5 corações, aplicar a perda de 1 coração por
 * contato com inimigo ambiental (respeitando o cooldown técnico de ~400ms por
 * inimigo) e sinalizar o game over ao chegar a 0. Independente do puzzle, que não
 * tem penalidade de vida.
 *
 * Referência: System Design §7 (Sistema de vida), §5 (cooldown técnico), §11.
 */
import { gameConfig } from '@/config/gameConfig';

const { maxHearts, damageCooldownMs } = gameConfig.combat;

export class HealthSystem {
  private hearts: number = maxHearts;
  private readonly lastHitAt = new Map<object, number>();

  public get current(): number {
    return this.hearts;
  }

  public get max(): number {
    return maxHearts;
  }

  public get empty(): boolean {
    return this.hearts === 0;
  }

  public hit(source: object, time: number): boolean {
    const last = this.lastHitAt.get(source) ?? Number.NEGATIVE_INFINITY;
    if (this.empty || time - last < damageCooldownMs) {
      return false;
    }
    this.lastHitAt.set(source, time);
    this.hearts -= 1;
    return true;
  }
}
