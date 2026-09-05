import type { CSSProperties, ReactNode } from "react";
import { deriveAccentTokens } from "@/utils/color";
import { fontSlugToCssVariable, parseDealerTheme } from "@/modules/dealer/utils/theme";
import type { Dealer } from "@/modules/dealer/services/dealerService";

interface TenantThemeProviderProps {
  dealer: Dealer;
  children: ReactNode;
}

// Server Component: derives --tenant-accent/-accent-ink (utils/color.ts)
// and --tenant-font-heading/-body (dealer/utils/theme.ts) from the
// dealer's row and fixes them as inline CSS custom properties on a
// wrapping element. Every component below just uses
// bg-accent/text-accent/font-heading like any other Tailwind class —
// never aware the value is dynamic. See AGENTS.md, "Per-tenant theming".
export function TenantThemeProvider({ dealer, children }: TenantThemeProviderProps) {
  const theme = parseDealerTheme(dealer.theme);
  const { accent, accentInk } = deriveAccentTokens(theme.accentColorHex);

  const tenantThemeStyle = {
    "--tenant-accent": accent,
    "--tenant-accent-ink": accentInk,
    "--tenant-font-heading": fontSlugToCssVariable(theme.headingFont),
    "--tenant-font-body": fontSlugToCssVariable(theme.bodyFont),
  } as CSSProperties;

  return (
    <div style={tenantThemeStyle} className="contents">
      {children}
    </div>
  );
}
