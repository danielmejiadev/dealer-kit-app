import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabaseClient";
import {
  getCurrentDealer,
  getCurrentDealerMember,
  type Dealer,
  type DealerMember,
} from "@/modules/dealer/services/dealerService";

interface AuthorizedDealerContext {
  dealer: Dealer;
  dealerMember: DealerMember;
}

/** 401/403 tipados para que las rutas los distingan de un error 500 real. */
export class AuthGuardError extends Error {
  status: 401 | 403;

  constructor(status: 401 | 403, message: string) {
    super(message);
    this.name = "AuthGuardError";
    this.status = status;
  }
}

/**
 * Guard compartido por cada Route Handler bajo api/v1/vehicles/**: sigue el
 * orden que pide AGENTS.md — getClaims() (401 si falta) →
 * getCurrentDealerMember() (403 si falta). No es una capa nueva sobre
 * services/, solo evita repetir estas dos llamadas en cada route.ts.
 */
export async function requireDealerMember(): Promise<AuthorizedDealerContext> {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase.auth.getClaims();

  if (error || !data?.claims) {
    throw new AuthGuardError(401, "No autenticado.");
  }

  const dealer = await getCurrentDealer();
  const dealerMember = await getCurrentDealerMember(data.claims.sub);

  if (!dealerMember) {
    throw new AuthGuardError(403, "No tienes acceso a este dealer.");
  }

  return { dealer, dealerMember };
}

/** null si `error` no es un AuthGuardError — para dejar pasar el 500 genérico del catch. */
export function authGuardErrorResponse(error: unknown): NextResponse | null {
  if (error instanceof AuthGuardError) {
    return NextResponse.json({ error: error.message }, { status: error.status });
  }
  return null;
}
