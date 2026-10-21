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

import { toNodeApiHandler } from "~/utils/fetch-api-handler";
import { isSameOrigin } from "~/utils/same-origin";
import { isServerFlagEnabled } from "~/utils/server-flags";

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

const json = (body: unknown, status: number) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });

export async function solanaRpcHandler(req: Request) {
  if (req.method !== "POST") {
    return json({ error: "Method not allowed" }, 405);
  }

  // Hidden, not forbidden: while Solana routes are off the route does not
  // exist, so a probe learns nothing about it.
  if (!(await isServerFlagEnabled(SOLANA_ROUTES_FLAG))) {
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

export default toNodeApiHandler(solanaRpcHandler);

export const config = {
  api: { bodyParser: false },
};
