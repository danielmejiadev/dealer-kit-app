// Shared fetch wrapper: throws ApiError (with per-field fieldErrors, if present) on a non-2xx response so hooks don't each repeat that parsing.

export class ApiError extends Error {
  status: number;
  /** Per-field validation errors, when the response includes them. */
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
