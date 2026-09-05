// Pure validation/normalization of dealers.theme (jsonb) — no external
// calls. See AGENTS.md, "utils/". The DB check constraint (dealers_theme_shape)
// already guarantees a valid shape on write, but this still validates on
// read: a defense-in-depth guard against a future migration relaxing that
// constraint, or a row read via a path that bypasses it.

export type FontSlug = "inter" | "ibm-plex-sans" | "sora" | "fraunces";

export interface DealerTheme {
  accentColorHex: string;
  headingFont: FontSlug;
  bodyFont: FontSlug;
}

// Matches the dealers_theme_shape check constraint (0001_create_core_schema.sql):
// headingFont may be any of these four, bodyFont only the first three
// (Fraunces is a display serif, reserved for headings).
const HEADING_FONTS: readonly FontSlug[] = ["inter", "ibm-plex-sans", "sora", "fraunces"];
const BODY_FONTS: readonly FontSlug[] = ["inter", "ibm-plex-sans", "sora"];
const HEX_COLOR_PATTERN = /^#[0-9a-fA-F]{6}$/;

export const DEFAULT_DEALER_THEME: DealerTheme = {
  accentColorHex: "#b8842e",
  headingFont: "inter",
  bodyFont: "inter",
};

// Maps a font slug stored in the DB to the CSS variable next/font/google
// exposes for it (each loaded in src/app/layout.tsx).
const FONT_CSS_VARIABLES: Record<FontSlug, string> = {
  inter: "var(--font-inter)",
  "ibm-plex-sans": "var(--font-ibm-plex-sans)",
  sora: "var(--font-sora)",
  fraunces: "var(--font-fraunces)",
};

function isAllowedFontSlug(value: unknown, allowedSlugs: readonly FontSlug[]): value is FontSlug {
  return typeof value === "string" && (allowedSlugs as readonly string[]).includes(value);
}

/**
 * Validates and normalizes the raw jsonb stored in dealers.theme: fills in
 * defaults for missing or invalid keys and discards anything unrecognized,
 * so a malformed or partial row never reaches rendering code.
 */
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
