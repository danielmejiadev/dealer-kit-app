import { type NextRequest, NextResponse } from "next/server";
import { sendMagicLink } from "@/modules/auth/services/authService";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const email = typeof body?.email === "string" ? body.email : null;

  if (!email) {
    return NextResponse.json({ error: "Falta el correo." }, { status: 400 });
  }

  const redirectTo = new URL("/auth/callback", request.url).toString();

  try {
    await sendMagicLink(email, redirectTo);
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
