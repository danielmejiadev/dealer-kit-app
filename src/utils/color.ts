// Pure color math for per-tenant theming — see AGENTS.md, "Per-tenant
// theming". No external calls, no Supabase/AI, no NextRequest: this is why
// it lives in utils/ instead of services/.

interface Rgb {
  red: number;
  green: number;
  blue: number;
}

interface Hsl {
  hue: number;
  saturation: number;
  lightness: number;
}

const HEX_COLOR_PATTERN = /^#[0-9a-fA-F]{6}$/;
const DEFAULT_ACCENT_HEX = "#b8842e";
const MIN_CONTRAST_RATIO = 4.5; // WCAG AA for normal text
const MIN_LIGHTNESS = 0.12; // stop darkening before the hue turns to black
const LIGHTNESS_STEP = 0.05;

export interface AccentTokens {
  /** The tenant's brand color as stored, used for fills/backgrounds. */
  accent: string;
  /** Same hue, darkened until it's safe as text/icons on a light surface. */
  accentInk: string;
}

function hexToRgb(hex: string): Rgb {
  const value = Number.parseInt(hex.slice(1), 16);
  return {
    red: (value >> 16) & 255,
    green: (value >> 8) & 255,
    blue: value & 255,
  };
}

function rgbToHex({ red, green, blue }: Rgb): string {
  const toHexPart = (channel: number) => Math.round(channel).toString(16).padStart(2, "0");
  return `#${toHexPart(red)}${toHexPart(green)}${toHexPart(blue)}`;
}

function rgbToHsl({ red, green, blue }: Rgb): Hsl {
  const normalizedRed = red / 255;
  const normalizedGreen = green / 255;
  const normalizedBlue = blue / 255;

  const max = Math.max(normalizedRed, normalizedGreen, normalizedBlue);
  const min = Math.min(normalizedRed, normalizedGreen, normalizedBlue);
  const lightness = (max + min) / 2;

  if (max === min) {
    return { hue: 0, saturation: 0, lightness };
  }

  const delta = max - min;
  const saturation = lightness > 0.5 ? delta / (2 - max - min) : delta / (max + min);

  let hue: number;
  if (max === normalizedRed) {
    hue = (normalizedGreen - normalizedBlue) / delta + (normalizedGreen < normalizedBlue ? 6 : 0);
  } else if (max === normalizedGreen) {
    hue = (normalizedBlue - normalizedRed) / delta + 2;
  } else {
    hue = (normalizedRed - normalizedGreen) / delta + 4;
  }

  return { hue: hue * 60, saturation, lightness };
}

function hueToChannel(pValue: number, qValue: number, hueFraction: number): number {
  let normalizedHueFraction = hueFraction;
  if (normalizedHueFraction < 0) normalizedHueFraction += 1;
  if (normalizedHueFraction > 1) normalizedHueFraction -= 1;
  if (normalizedHueFraction < 1 / 6) return pValue + (qValue - pValue) * 6 * normalizedHueFraction;
  if (normalizedHueFraction < 1 / 2) return qValue;
  if (normalizedHueFraction < 2 / 3) return pValue + (qValue - pValue) * (2 / 3 - normalizedHueFraction) * 6;
  return pValue;
}

function hslToRgb({ hue, saturation, lightness }: Hsl): Rgb {
  if (saturation === 0) {
    const gray = lightness * 255;
    return { red: gray, green: gray, blue: gray };
  }

  const qValue =
    lightness < 0.5 ? lightness * (1 + saturation) : lightness + saturation - lightness * saturation;
  const pValue = 2 * lightness - qValue;
  const normalizedHue = hue / 360;

  return {
    red: hueToChannel(pValue, qValue, normalizedHue + 1 / 3) * 255,
    green: hueToChannel(pValue, qValue, normalizedHue) * 255,
    blue: hueToChannel(pValue, qValue, normalizedHue - 1 / 3) * 255,
  };
}

function channelLuminance(channel: number): number {
  const normalized = channel / 255;
  return normalized <= 0.03928 ? normalized / 12.92 : ((normalized + 0.055) / 1.055) ** 2.4;
}

function relativeLuminance({ red, green, blue }: Rgb): number {
  return 0.2126 * channelLuminance(red) + 0.7152 * channelLuminance(green) + 0.0722 * channelLuminance(blue);
}

// Contrast ratio of a color against a white (#fff) surface, per WCAG 2.x.
function contrastRatioAgainstWhite(rgb: Rgb): number {
  return 1.05 / (relativeLuminance(rgb) + 0.05);
}

function isValidAccentHex(value: string): boolean {
  return HEX_COLOR_PATTERN.test(value);
}

/**
 * Derives the two CSS custom property values a tenant layout sets inline
 * (--tenant-accent, --tenant-accent-ink): the brand color as stored (for
 * fills/backgrounds), plus a darkened version of the same hue that clears
 * WCAG AA contrast against a light surface (for text/icons that need to
 * read as "branded" without failing accessibility). Falls back to
 * DealerKit's own default accent for anything that isn't a valid 6-digit
 * hex color — the same default `tokens/colors.css` uses.
 */
export function deriveAccentTokens(accentColorHex: string): AccentTokens {
  const safeHex = isValidAccentHex(accentColorHex) ? accentColorHex : DEFAULT_ACCENT_HEX;
  const baseHsl = rgbToHsl(hexToRgb(safeHex));

  let candidateHsl = baseHsl;
  while (
    candidateHsl.lightness > MIN_LIGHTNESS &&
    contrastRatioAgainstWhite(hslToRgb(candidateHsl)) < MIN_CONTRAST_RATIO
  ) {
    candidateHsl = {
      ...candidateHsl,
      lightness: Math.max(MIN_LIGHTNESS, candidateHsl.lightness - LIGHTNESS_STEP),
    };
  }

  return {
    accent: safeHex,
    accentInk: rgbToHex(hslToRgb(candidateHsl)),
  };
}
