// The dealers_theme_shape check constraint guarantees a valid shape on write; this is a defense-in-depth re-check on read.
import type { SelectOption } from "@/components/ui/Select";

export type FontSlug = "inter" | "ibm-plex-sans" | "sora" | "fraunces";

export interface DealerTheme {
  accentColorHex: string;
  headingFont: FontSlug;
  bodyFont: FontSlug;
}

// Matches dealers_theme_shape: bodyFont excludes Fraunces, a display serif reserved for headings.
export const HEADING_FONTS: readonly FontSlug[] = ["inter", "ibm-plex-sans", "sora", "fraunces"];
export const BODY_FONTS: readonly FontSlug[] = ["inter", "ibm-plex-sans", "sora"];
export const HEX_COLOR_PATTERN = /^#[0-9a-fA-F]{6}$/;

export const FONT_LABELS: Record<FontSlug, string> = {
  inter: "Inter",
  "ibm-plex-sans": "IBM Plex Sans",
  sora: "Sora",
  fraunces: "Fraunces",
};

export const HEADING_FONT_OPTIONS: SelectOption[] = HEADING_FONTS.map((fontSlug) => ({
  value: fontSlug,
  label: FONT_LABELS[fontSlug],
}));

export const BODY_FONT_OPTIONS: SelectOption[] = BODY_FONTS.map((fontSlug) => ({
  value: fontSlug,
  label: FONT_LABELS[fontSlug],
}));

export const DEFAULT_DEALER_THEME: DealerTheme = {
  accentColorHex: "#b8842e",
  headingFont: "inter",
  bodyFont: "inter",
};

// Maps a DB font slug to the CSS variable next/font/google exposes for it in src/app/layout.tsx.
const FONT_CSS_VARIABLES: Record<FontSlug, string> = {
  inter: "var(--font-inter)",
  "ibm-plex-sans": "var(--font-ibm-plex-sans)",
  sora: "var(--font-sora)",
  fraunces: "var(--font-fraunces)",
};

function isAllowedFontSlug(value: unknown, allowedSlugs: readonly FontSlug[]): value is FontSlug {
  return typeof value === "string" && (allowedSlugs as readonly string[]).includes(value);
}

/** Fills in defaults for missing or invalid keys so a malformed row never reaches rendering code. */
export function parseDealerTheme(rawTheme: unknown): DealerTheme {
  if (typeof rawTheme !== "object" || rawTheme === null) {
    return DEFAULT_DEALER_THEME;
  }

  const candidate = rawTheme as Record<string, unknown>;

  const accentColorHex =
    typeof candidate.accentColorHex === "string" && HEX_COLOR_PATTERN.test(candidate.accentColorHex)
      ? candidate.accentColorHex
      : DEFAULT_DEALER_THEME.accentColorHex;

  const headingFont = isAllowedFontSlug(candidate.headingFont, HEADING_FONTS)
    ? candidate.headingFont
    : DEFAULT_DEALER_THEME.headingFont;

  const bodyFont = isAllowedFontSlug(candidate.bodyFont, BODY_FONTS)
    ? candidate.bodyFont
    : DEFAULT_DEALER_THEME.bodyFont;

  return { accentColorHex, headingFont, bodyFont };
}

export function fontSlugToCssVariable(fontSlug: FontSlug): string {
  return FONT_CSS_VARIABLES[fontSlug];
}
