import { NextResponse } from "next/server";
import { logout } from "@/modules/auth/services/authService";

export async function POST() {
  try {
    await logout();
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
