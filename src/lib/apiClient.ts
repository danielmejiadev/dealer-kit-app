// Thin fetch wrapper shared by every hook that calls our own Route
// Handlers (app/api/v1/**) — parses JSON and throws a normal Error
// carrying the server's message on a non-2xx response, so hooks don't
// each repeat the same response-parsing boilerplate. Still just a
// low-level client, no business logic — see AGENTS.md, "lib/".

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

export async function fetchJson<ResponseBody>(
  input: string,
  init?: RequestInit
): Promise<ResponseBody> {
  const response = await fetch(input, init);

  if (!response.ok) {
    const errorBody = (await response.json().catch(() => null)) as { error?: string } | null;
    throw new ApiError(errorBody?.error ?? `Error ${response.status}`, response.status);
  }

  if (response.status === 204) {
    return undefined as ResponseBody;
  }

  return response.json();
}
