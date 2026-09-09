import { NextResponse } from "next/server";
import type { ZodError } from "zod";

// Keeps the response shape ApiClient (src/lib/apiClient.ts) already expects:
// one message per field, not zod's flatten() array of messages per field.
export function fieldErrorsResponse(error: ZodError): NextResponse {
  // Field names are only known once `error` is instantiated at the call
  // site, not inside this generic helper — safe to widen here.
  const flattened = error.flatten().fieldErrors as Record<string, string[] | undefined>;
  const fieldErrors: Record<string, string> = {};

  for (const [field, messages] of Object.entries(flattened)) {
    if (messages?.[0]) fieldErrors[field] = messages[0];
  }

  return NextResponse.json({ error: "Datos inválidos.", fieldErrors }, { status: 400 });
}
