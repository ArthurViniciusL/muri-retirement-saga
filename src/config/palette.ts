// Cordel Arcade (guidelines.md §2): bone, sertao and ink are the invite's three
// colours; dust, clay and umber are mixes between them, never a new hue.
export const palette = {
  bone: 0xf4eedd,
  dust: 0xd2c3af,
  clay: 0xb09882,
  sertao: 0x6b4226,
  umber: 0x442b1b,
  ink: 0x1c1410,
} as const;

export type PaletteTone = keyof typeof palette;

export function paletteCss(tone: PaletteTone): string {
  return `#${palette[tone].toString(16).padStart(6, '0')}`;
}

export const sera = {
  primary: palette.ink,
  primaryHover: palette.sertao,
  muted: palette.dust,
} as const;
