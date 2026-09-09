// Single source of truth for the dealer theme form: DealerThemeForm uses it
// via zodResolver(), and PATCH /api/v1/dealer reuses it via safeParse()
// instead of duplicating the rules server-side. Value constraints mirror the
// dealers_theme_shape check constraint in supabase/migrations/0001_create_core_schema.sql.
import { z } from "zod";
import { BODY_FONTS, HEADING_FONTS, HEX_COLOR_PATTERN, type DealerTheme } from "./theme";

const HEADING_FONT_VALUES = HEADING_FONTS as [DealerTheme["headingFont"], ...DealerTheme["headingFont"][]];
const BODY_FONT_VALUES = BODY_FONTS as [DealerTheme["bodyFont"], ...DealerTheme["bodyFont"][]];

export const dealerThemeFormSchema = z.object({
  accentColorHex: z
    .string()
    .regex(HEX_COLOR_PATTERN, "El color debe ser un hex de 6 dígitos, ej. #b8842e."),
  headingFont: z.enum(HEADING_FONT_VALUES, { error: "Selecciona una fuente de título válida." }),
  bodyFont: z.enum(BODY_FONT_VALUES, { error: "Selecciona una fuente de cuerpo válida." }),
});

export type DealerThemeFormValues = z.infer<typeof dealerThemeFormSchema>;
