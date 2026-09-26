export class CurrencySystem {
  private coins = 0;

  public get collected(): number {
    return this.coins;
  }

  public add(amount = 1): void {
    this.coins += amount;
  }
}
