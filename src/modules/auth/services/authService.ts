import { createServerSupabaseClient } from "@/lib/supabaseClient";

/** `redirectTo` comes from the Route Handler, the only layer that sees `NextRequest` and can build the absolute `/auth/callback` URL. */
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

/** Exchanges the `code` Supabase appends to the email link for a session, stored in cookies. Called from `GET /auth/callback`. */
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
