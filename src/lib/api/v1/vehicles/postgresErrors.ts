// Services rethrow the original Postgres error in `cause` so routes can distinguish constraint violations without querying Supabase again.
const UNIQUE_VIOLATION_CODE = "23505";

export function isUniqueConstraintViolation(error: unknown): boolean {
  if (!(error instanceof Error)) return false;
  const cause = error.cause as { code?: string } | undefined;
  return cause?.code === UNIQUE_VIOLATION_CODE;
}
