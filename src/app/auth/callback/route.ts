import { type NextRequest, NextResponse } from "next/server";
import { exchangeMagicLinkCode } from "@/modules/auth/services/authService";

// Único punto que rompe la convención api/v1 a propósito: es un redirect
// de navegador desde el link del correo, no un fetch() de un hook — ver
// AGENTS.md / docs/plans/fase-1-catalogo-admin.md, "Autenticación del admin".
export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");

  if (code) {
    try {
      await exchangeMagicLinkCode(code);
    } catch {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }
  }

  return NextResponse.redirect(new URL("/admin", request.url));
}
