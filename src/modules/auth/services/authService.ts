import { createServerSupabaseClient } from "@/lib/supabaseClient";

/**
 * Envía el magic link de acceso al admin. `redirectTo` viene del Route
 * Handler (única capa que ve `NextRequest`, ver AGENTS.md "services/") para
 * construir la URL absoluta de `/auth/callback` según el host de la
 * petición.
 */
export async function sendMagicLink(email: string, redirectTo: string): Promise<void> {
  const supabase = await createServerSupabaseClient();
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: { emailRedirectTo: redirectTo },
  });

  if (error) {
    throw new Error(`No se pudo enviar el magic link: ${error.message}`);
  }
}

/**
 * Intercambia el `code` que Supabase agrega al link del correo por una
 * sesión, dejándola en cookies vía el cliente de servidor. Llamado desde
 * `GET /auth/callback` — el único punto que rompe la convención `api/v1` a
 * propósito, porque es un redirect de navegador, no un `fetch()` de un hook.
 */
export async function exchangeMagicLinkCode(code: string): Promise<void> {
  const supabase = await createServerSupabaseClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    throw new Error(`No se pudo completar el login: ${error.message}`);
  }
}

export async function logout(): Promise<void> {
  const supabase = await createServerSupabaseClient();
  const { error } = await supabase.auth.signOut();

  if (error) {
    throw new Error(`No se pudo cerrar la sesión: ${error.message}`);
  }
}
