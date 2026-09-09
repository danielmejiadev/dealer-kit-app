// Root hosts that carry no tenant subdomain. Plain "everything before the
// first dot" isn't enough on its own: the production apex domain itself
// contains dots (it's a Cloudflare Workers subdomain), so it must be
// listed explicitly rather than inferred from dot-count.
const ROOT_HOSTNAMES: readonly string[] = ["localhost", "dealer-kit-app.luisdanielmejia.workers.dev"];

/**
 * Extracts the tenant slug from a `host` header, e.g. `eldorado.localhost:3000` -> "eldorado".
 * Returns null for a root host (no subdomain), e.g. `localhost:3000` or the bare production domain.
 */
export function extractDealerSlugFromHost(host: string): string | null {
  const hostname = host.split(":")[0];

  if (!hostname || ROOT_HOSTNAMES.includes(hostname)) {
    return null;
  }

  return hostname.split(".")[0];
}
