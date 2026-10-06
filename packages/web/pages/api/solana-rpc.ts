/**
 * Forwards the browser's Solana JSON-RPC reads to the configured provider.
 *
 * The provider URL (`SOLANA_RPC_URL`) carries an API key, so it stays on the
 * server; the browser only ever calls this route. Solana documents its public
 * mainnet-beta endpoint as rate-limited and unsuitable for production, which
 * is the fallback when no provider is configured.
 *
 * Three things keep the route from being a general proxy for our key:
 * - It answers 404 while the `solana-skip-routes` flag is off, read from
 *   LaunchDarkly server-side, so the pathway does not exist until Solana
 *   routes are offered (and the flag is a kill switch for it afterwards).
 * - It only accepts same-origin browser requests: browsers always send
 *   `Origin` on a POST fetch, so a missing or foreign origin is refused.
 * - Only the methods the Solana bridge flow uses are forwarded, one request
 *   at a time.
 */

import { SOLANA_PUBLIC_RPC_URL } from "@osmosis-labs/bridge/build/utils/solana";

/** Methods the in-app Solana bridge flow calls from the browser. */
export const ALLOWED_SOLANA_RPC_METHODS = new Set([
  // SPL balances of a deposit source
  "getTokenAccountsByOwner",
  // withdrawal destination check (a wallet, not a token account)
  "getAccountInfo",
  // preflight before Phantom opens
  "simulateTransaction",
  // fallback broadcast when Phantom can only sign
  "sendTransaction",
  // watching a submitted transaction
  "getSignatureStatuses",
  "isBlockhashValid",
]);

/** A Solana transaction is at most 1232 bytes; this leaves ample room for
 *  base64 and the JSON envelope. */
const MAX_BODY_BYTES = 16 * 1024;

/** LaunchDarkly flag that offers Solana routes in the app (`solanaSkipRoutes`
 *  in code). The route is only reachable while it is on. */
const SOLANA_ROUTES_FLAG = "solana-skip-routes";
/** How long a flag read is reused before asking LaunchDarkly again. */
const FLAG_CACHE_MS = 60_000;
/** A LaunchDarkly read that takes longer than this is treated as failed, so
 *  a hung request falls through to the stale value (or fails closed) instead
 *  of holding every RPC call. Covers the response body as well. */
const FLAG_FETCH_TIMEOUT_MS = 2_000;
/** If LaunchDarkly cannot be reached, a value this old is still trusted
 *  rather than failing closed on a transient error. */
const FLAG_STALE_MS = 10 * 60_000;

let flagCache: { value: boolean; readAt: number } | undefined;

/** Test-only: forget the cached flag read. */
export function resetSolanaRpcFlagCache() {
  flagCache = undefined;
}

const base64url = (s: string) =>
  btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");

/**
 * Reads `solana-skip-routes` for the server through LaunchDarkly's
 * client-side evaluation endpoint, which needs no SDK (the Node client SDK
 * does not run on the Edge runtime) and only the public client-side id the
 * browser already ships with. Without a client-side id (local development)
 * nothing can be evaluated and the route stays open.
 */
async function isSolanaRouteEnabled(): Promise<boolean> {
  const clientSideId = process.env.NEXT_PUBLIC_LAUNCH_DARKLY_CLIENT_SIDE_ID;
  if (!clientSideId) return true;

  const now = Date.now();
  if (flagCache && now - flagCache.readAt < FLAG_CACHE_MS) {
    return flagCache.value;
  }

  try {
    const context = base64url(
      JSON.stringify({
        kind: "user",
        key: "osmosis-frontend-server",
        anonymous: true,
      })
    );
    const response = await fetch(
      `https://clientsdk.launchdarkly.com/sdk/evalx/${clientSideId}/contexts/${context}`,
      { signal: AbortSignal.timeout(FLAG_FETCH_TIMEOUT_MS) }
    );
    if (!response.ok) throw new Error(`LaunchDarkly ${response.status}`);
    const flags = (await response.json()) as Record<
      string,
      { value?: unknown } | undefined
    >;
    const value = flags[SOLANA_ROUTES_FLAG]?.value === true;
    flagCache = { value, readAt: now };
    return value;
  } catch {
    if (flagCache && now - flagCache.readAt < FLAG_STALE_MS) {
      return flagCache.value;
    }
    return false;
  }
}

/** The request's own host, as the browser addressed it. Vercel and the CDN in
 *  front of it forward the public host in `x-forwarded-host`. */
function requestHosts(req: Request): Set<string> {
  const hosts = new Set<string>();
  for (const header of ["x-forwarded-host", "host"]) {
    const value = req.headers.get(header);
    if (value) hosts.add(value.split(",")[0]!.trim().toLowerCase());
  }
  try {
    hosts.add(new URL(req.url).host.toLowerCase());
  } catch {
    // req.url may be relative in tests
  }
  return hosts;
}

/** Whether the request comes from this app's own pages. Browsers send
 *  `Origin` on every POST fetch; `Referer` is accepted as a fallback. */
function isSameOrigin(req: Request): boolean {
  const hosts = requestHosts(req);
  if (hosts.size === 0) return false;
  for (const header of ["origin", "referer"]) {
    const value = req.headers.get(header);
    if (!value) continue;
    try {
      return hosts.has(new URL(value).host.toLowerCase());
    } catch {
      return false;
    }
  }
  return false;
}

const json = (body: unknown, status: number) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });

export default async function solanaRpcHandler(req: Request) {
  if (req.method !== "POST") {
    return json({ error: "Method not allowed" }, 405);
  }

  // Hidden, not forbidden: while Solana routes are off the route does not
  // exist, so a probe learns nothing about it.
  if (!(await isSolanaRouteEnabled())) {
    return json({ error: "Not found" }, 404);
  }

  if (!isSameOrigin(req)) {
    return json({ error: "Forbidden" }, 403);
  }

  // Refuse a declared oversize body before reading it into memory, then
  // measure the body actually read in UTF-8 bytes (string length counts
  // UTF-16 code units, which undercounts multi-byte characters).
  const declaredLength = Number(req.headers.get("content-length"));
  if (declaredLength > MAX_BODY_BYTES) {
    return json({ error: "Request too large" }, 413);
  }
  const text = await req.text();
  if (new TextEncoder().encode(text).byteLength > MAX_BODY_BYTES) {
    return json({ error: "Request too large" }, 413);
  }

  let request: unknown;
  try {
    request = JSON.parse(text);
  } catch {
    return json({ error: "Invalid JSON" }, 400);
  }

  // Single requests only: a JSON-RPC batch would let one call carry any
  // number of methods past the allowlist check.
  if (
    typeof request !== "object" ||
    request === null ||
    Array.isArray(request)
  ) {
    return json({ error: "Expected a single JSON-RPC request" }, 400);
  }

  const { id, method, params } = request as {
    id?: unknown;
    method?: unknown;
    params?: unknown;
  };

  if (typeof method !== "string" || !ALLOWED_SOLANA_RPC_METHODS.has(method)) {
    return json({ error: "Method not allowed" }, 400);
  }
  if (params !== undefined && !Array.isArray(params)) {
    return json({ error: "Invalid params" }, 400);
  }

  const upstream = process.env.SOLANA_RPC_URL?.trim() || SOLANA_PUBLIC_RPC_URL;

  try {
    const response = await fetch(upstream, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: id ?? 1,
        method,
        params: params ?? [],
      }),
    });

    // JSON-RPC reports method errors inside a 200 body; pass those through
    // as-is. Anything else is an upstream failure.
    if (!response.ok) {
      return json({ error: `Solana RPC responded ${response.status}` }, 502);
    }

    return json(await response.json(), 200);
  } catch {
    // Never echo the upstream URL: it carries the provider key.
    return json({ error: "Solana RPC unreachable" }, 502);
  }
}

export const config = {
  runtime: "edge",
};
