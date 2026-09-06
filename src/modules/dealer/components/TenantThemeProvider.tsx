import type { CSSProperties, ReactNode } from "react";
import { deriveAccentTokens } from "@/utils/color";
import { fontSlugToCssVariable, parseDealerTheme } from "@/modules/dealer/utils/theme";
import type { Dealer } from "@/modules/dealer/services/dealerService";

interface TenantThemeProviderProps {
  dealer: Dealer;
  children: ReactNode;
}

// Sets the tenant's derived tokens as inline CSS custom properties so components below just use bg-accent/font-heading, unaware the value is dynamic.
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
