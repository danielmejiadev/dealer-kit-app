import type { Metadata } from "next";
import { Inter, IBM_Plex_Mono, IBM_Plex_Sans, Sora, Fraunces } from "next/font/google";
import Providers from "./providers";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

const ibmPlexMono = IBM_Plex_Mono({
  variable: "--font-ibm-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});

// Loaded for per-tenant typography (see AGENTS.md, "Per-tenant theming" and
// styles/tokens/typography.css) — the curated list a dealer's theme.jsonb
// can pick from, enforced by the dealers_theme_shape check constraint.
// Nothing in Fase 1 lets a dealer choose one yet; the seeded dealer uses
// Inter for both, so these three only exercise the fallback path today.
const ibmPlexSans = IBM_Plex_Sans({
  variable: "--font-ibm-plex-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

const sora = Sora({
  variable: "--font-sora",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "DealerKit",
  description:
    "Catálogo público y panel de administración para compraventas de vehículos en Colombia.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="es"
      className={`${inter.variable} ${ibmPlexMono.variable} ${ibmPlexSans.variable} ${sora.variable} ${fraunces.variable} antialiased`}
    >
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
