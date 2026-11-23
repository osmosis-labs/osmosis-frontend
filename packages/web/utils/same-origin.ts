/**
 * Same-origin checks for API routes that forward browser requests to keyed
 * upstream providers (Solana and EVM RPC). A non-browser client can forge
 * these headers, so this keeps other sites' pages from using our keys, not a
 * determined script; method allowlists and body caps bound the rest.
 */

const TRUSTED_FORWARDED_HOST =
  /^(?:(?:[a-z0-9-]+\.)*osmosis\.zone|(?:[a-z0-9-]+\.)+workers\.dev|(?:localhost|127\.0\.0\.1)(?::\d+)?)$/;

/** The origins this request could legitimately have come from: the scheme
 *  the browser used with the request's own host. `x-forwarded-host` is
 *  accepted only for known first-party/preview/local hosts so a spoofed
 *  header cannot add an attacker's domain to the trusted set. */
function trustedOrigins(req: Request): Set<string> {
  let requestUrl: URL | undefined;
  try {
    requestUrl = new URL(req.url);
  } catch {
    // req.url may be relative in tests
  }
  const forwardedProto = req.headers
    .get("x-forwarded-proto")
    ?.split(",")[0]
    ?.trim()
    .toLowerCase();
  const scheme =
    forwardedProto === "https"
      ? "https"
      : (requestUrl?.protocol.replace(":", "") ?? "https");

  const hosts = new Set<string>();
  const forwardedHost = req.headers
    .get("x-forwarded-host")
    ?.split(",")[0]
    ?.trim()
    .toLowerCase();
  if (forwardedHost && TRUSTED_FORWARDED_HOST.test(forwardedHost)) {
    hosts.add(forwardedHost);
  }
  const hostHeader = req.headers
    .get("host")
    ?.split(",")[0]
    ?.trim()
    .toLowerCase();
  if (hostHeader) hosts.add(hostHeader);
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
