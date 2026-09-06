import { type NextRequest, NextResponse } from "next/server";
import { exchangeMagicLinkCode } from "@/modules/auth/services/authService";

// Deliberately breaks the api/v1 convention: this is a browser redirect from the email link, not a hook's fetch().
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
