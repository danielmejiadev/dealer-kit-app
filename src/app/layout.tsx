import type { Metadata } from "next";
import { Inter, IBM_Plex_Mono } from "next/font/google";
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

export const metadata: Metadata = {
  title: "DealerKit",
  description:
    "Catálogo público y panel de administración para compraventas de vehículos en Colombia.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es" className={`${inter.variable} ${ibmPlexMono.variable} antialiased`}>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
