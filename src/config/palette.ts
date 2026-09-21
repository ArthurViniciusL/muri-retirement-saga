/**
 * palette — escala zinc do jogo, em um único lugar.
 *
 * Responsabilidade: expor os tons zinc como número (para Graphics/cor de fundo do
 * Phaser) e como string CSS (para desenho em canvas). Nenhuma cena ou entidade repete
 * um HEX literal.
 *
 * Mapeamento para o "Cordel Arcade" do convite: Branco Osso vira `zinc-50` (papel),
 * Preto Entalhe vira `zinc-950` (entalhe) e o Marrom Sertão de apoio vira os tons
 * médios `zinc-500`/`zinc-600`.
 *
 * Referência: Guia de Estilo §2; `.agents/rules/art-palette-zinc.md`.
 */
export const zinc = {
  50: 0xfafafa,
  100: 0xf4f4f5,
  200: 0xe4e4e7,
  300: 0xd4d4d8,
  400: 0xa1a1aa,
  500: 0x71717a,
  600: 0x52525b,
  700: 0x3f3f46,
  800: 0x27272a,
  900: 0x18181b,
  950: 0x09090b,
} as const;

export type ZincTone = keyof typeof zinc;

export function zincCss(tone: ZincTone): string {
  return `#${zinc[tone].toString(16).padStart(6, '0')}`;
}

/**
 * Tokens do tema "neutral" do shadcn, usados só nos componentes shadcn (estilo Sera)
 * do menu, a pedido do dono do projeto. É uma exceção consciente à regra "zinc sem
 * exceções". `primaryHover` é o `hover:bg-primary/80` do Sera já composto sobre o
 * papel, em tom sólido, porque o jogo não usa transparência.
 */
export const neutral = {
  primary: 0x171717, // neutral-900
  primaryHover: 0x444444,
  // `primary-foreground` (neutral-50) é idêntico a zinc-50; o rótulo usa a fonte zinc-50.
} as const;
