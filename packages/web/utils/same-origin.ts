/**
 * Same-origin checks for API routes that forward browser requests to keyed
 * upstream providers (Solana and EVM RPC). A non-browser client can forge
 * these headers, so this keeps other sites' pages from using our keys, not a
 * determined script; method allowlists and body caps bound the rest.
 */

/** The origins this request could legitimately have come from: the scheme
 *  the browser used (forwarded by the CDN and Vercel) with the request's own
 *  host, including the public host in `x-forwarded-host`. Localhost also
 *  accepts plain http for development. */
function trustedOrigins(req: Request): Set<string> {
  let requestUrl: URL | undefined;
  try {
    requestUrl = new URL(req.url);
  } catch {
    // req.url may be relative in tests
  }
  const scheme =
    req.headers.get("x-forwarded-proto")?.split(",")[0]!.trim().toLowerCase() ??
    requestUrl?.protocol.replace(":", "") ??
    "https";

  const hosts = new Set<string>();
  for (const header of ["x-forwarded-host", "host"]) {
    const value = req.headers.get(header);
    if (value) hosts.add(value.split(",")[0]!.trim().toLowerCase());
  }
  if (requestUrl) hosts.add(requestUrl.host.toLowerCase());

  const origins = new Set<string>();
  for (const host of hosts) {
    origins.add(`${scheme}://${host}`);
    if (/^(localhost|127\.0\.0\.1)(:\d+)?$/.test(host)) {
      origins.add(`http://${host}`);
    }
  }
  return origins;
}

/** Whether the request comes from this app's own pages: the `Origin` (or, as
 *  a fallback, the `Referer`) must match a trusted origin exactly, scheme and
 *  port included. Browsers send `Origin` on every POST fetch. */
export function isSameOrigin(req: Request): boolean {
  const origins = trustedOrigins(req);
  if (origins.size === 0) return false;
  for (const header of ["origin", "referer"]) {
    const value = req.headers.get(header);
    if (!value) continue;
    try {
      return origins.has(new URL(value).origin.toLowerCase());
    } catch {
      return false;
    }
  }
  return false;
}
