// Thin fetch wrapper shared by every hook that calls our own Route
// Handlers (app/api/v1/**) — parses JSON and throws an ApiError carrying
// the server's message (and its per-field `fieldErrors`, when the
// response includes them) on a non-2xx response, so hooks don't each
// repeat the same response-parsing boilerplate. Still just a low-level
// client, no business logic — see AGENTS.md, "lib/".

export class ApiError extends Error {
  status: number;
  /** Errores de validación por campo, cuando la respuesta los trae (ver `app/api/v1/vehicles/**`). */
  fieldErrors?: Record<string, string>;

  constructor(message: string, status: number, fieldErrors?: Record<string, string>) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.fieldErrors = fieldErrors;
  }
}

export async function fetchJson<ResponseBody>(
  input: string,
  init?: RequestInit
): Promise<ResponseBody> {
  const response = await fetch(input, init);

  if (!response.ok) {
    const errorBody = (await response.json().catch(() => null)) as {
      error?: string;
      fieldErrors?: Record<string, string>;
    } | null;
    throw new ApiError(errorBody?.error ?? `Error ${response.status}`, response.status, errorBody?.fieldErrors);
  }

  if (response.status === 204) {
    return undefined as ResponseBody;
  }

  return response.json();
}
