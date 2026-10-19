/**
 * Forwards the browser's EVM JSON-RPC reads to the chain's configured keyed
 * provider (`EVM_RPC_URL_<chainId>`), falling back to the chain's public
 * endpoints. The keyed URLs stay on the server; the browser only ever calls
 * `/api/evm-rpc?chainId=<id>`, and only for chains with a provider
 * configured (see `getClientEvmRpcUrls`).
 *
 * What keeps the route from being a general proxy for our keys:
 * - It answers 404 while the `evm-rpc-proxy` flag is off, read from
 *   LaunchDarkly server-side, so the pathway does not exist until it is
 *   switched on (and the flag is a kill switch for it afterwards). The
 *   browser then uses the public endpoints directly.
 * - It only accepts same-origin browser requests.
 * - Only the read methods the bridge and wallet flows use are forwarded, one
 *   request at a time. Transactions are broadcast by the user's wallet, never
 *   through here.
 * - Only chains in `EthereumChainInfo` that have a provider configured are
 *   served.
 */

import {
  EthereumChainInfo,
  getConfiguredEvmRpcUrls,
  getServerEvmRpcUrls,
} from "@osmosis-labs/utils";

import { isSameOrigin } from "~/utils/same-origin";
import { isServerFlagEnabled } from "~/utils/server-flags";

/** Read methods the browser calls through wagmi and viem public clients:
 *  balances and contract reads, fee and gas estimation, and receipt polling
 *  after the wallet broadcasts. */
export const ALLOWED_EVM_RPC_METHODS = new Set([
  "eth_chainId",
  "eth_blockNumber",
  "eth_getBlockByNumber",
  "eth_call",
  "eth_getBalance",
  "eth_getCode",
  "eth_getTransactionCount",
  "eth_estimateGas",
  "eth_gasPrice",
  "eth_maxPriorityFeePerGas",
  "eth_feeHistory",
  "eth_getTransactionByHash",
  "eth_getTransactionReceipt",
]);

/** Contract calls and gas estimates carry calldata (bridge router calls can
 *  run to several KB); this leaves ample room for that and the envelope. */
const MAX_BODY_BYTES = 64 * 1024;

/** Each upstream gets this long before the next one is tried, so one hung
 *  provider can't hold the request. */
const UPSTREAM_TIMEOUT_MS = 5_000;
/** LaunchDarkly flag that opens the route (`evmRpcProxy` in code). */
const EVM_RPC_PROXY_FLAG = "evm-rpc-proxy";
/** The whole fallback chain stops after this, below viem's 10s default
 *  client timeout, so the browser's own direct fallback to the public
 *  endpoints starts instead of waiting on every upstream in turn. */
const TOTAL_TIMEOUT_MS = 8_000;
/** JSON-RPC "internal error" (EIP-1474). */
const INTERNAL_ERROR_CODE = -32603;

/**
 * Whether a JSON-RPC error is the provider refusing service rather than an
 * answer about the chain: an exhausted quota or rate limit (some providers
 * report these inside a 200 body instead of a 429; -32005 is EIP-1474's
 * "limit exceeded"), or a load balancer with no node able to serve the call
 * (dRPC answers state-override estimateGas on some chains with "Can't route
 * your request"), or a key not enabled for the chain (Alchemy answers
 * "<NETWORK> is not enabled for this app"). Those must fall through to the
 * next upstream like a 429.
 */
function isProviderRefusal(
  error: { code?: unknown; message?: unknown } | undefined
): boolean {
  if (!error) return false;
  if (error.code === -32005) return true;
  return (
    typeof error.message === "string" &&
    /rate limit|quota|capacity|too many requests|limit exceeded|can't route|not enabled for this app/i.test(
      error.message
    )
  );
}

const json = (body: unknown, status: number) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });

export default async function evmRpcHandler(req: Request) {
  if (req.method !== "POST") {
    return json({ error: "Method not allowed" }, 405);
  }

  let chainId: number;
  try {
    chainId = Number(new URL(req.url).searchParams.get("chainId"));
  } catch {
    return json({ error: "Not found" }, 404);
  }
  const chain = EthereumChainInfo.find((c) => c.id === chainId);
  // Chains without a keyed provider are served by their public endpoints
  // directly from the browser; there is nothing to proxy.
  if (!chain || getConfiguredEvmRpcUrls(chain.id).length === 0) {
    return json({ error: "Not found" }, 404);
  }

  // Hidden, not forbidden: while the flag is off the route does not exist.
  if (!(await isServerFlagEnabled(EVM_RPC_PROXY_FLAG))) {
    return json({ error: "Not found" }, 404);
  }

  if (!isSameOrigin(req)) {
    return json({ error: "Forbidden" }, 403);
  }

  // Refuse a declared oversize body before reading it into memory, then
  // measure the body actually read in UTF-8 bytes.
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

  if (typeof method !== "string" || !ALLOWED_EVM_RPC_METHODS.has(method)) {
    return json({ error: "Method not allowed" }, 400);
  }
  if (params !== undefined && !Array.isArray(params)) {
    return json({ error: "Invalid params" }, 400);
  }

  const body = JSON.stringify({
    jsonrpc: "2.0",
    id: id ?? 1,
    method,
    params: params ?? [],
  });

  // Keyed providers first, then public endpoints, so an exhausted free-tier
  // quota or a provider outage degrades instead of failing.
  const deadline = Date.now() + TOTAL_TIMEOUT_MS;
  let internalErrorAnswer: unknown;
  for (const upstream of getServerEvmRpcUrls(chain)) {
    const remaining = deadline - Date.now();
    if (remaining <= 0) break;
    try {
      const response = await fetch(upstream, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body,
        signal: AbortSignal.timeout(Math.min(UPSTREAM_TIMEOUT_MS, remaining)),
      });
      // JSON-RPC reports method errors (e.g. a revert) inside a 200 body;
      // pass those through as-is, since another upstream would answer the
      // same. Anything else is an upstream failure: try the next one.
      if (!response.ok) continue;
      const result = (await response.json()) as {
        error?: { code?: unknown; message?: unknown };
      };
      if (isProviderRefusal(result.error)) continue;
      // -32603 is either a passing node failure ("header not found", a
      // backend timeout) or, on some nodes, a real revert. Ask the next
      // upstream, and return this answer only if none answers better.
      if (result.error?.code === INTERNAL_ERROR_CODE) {
        internalErrorAnswer = result;
        continue;
      }
      return json(result, 200);
    } catch {
      // Never echo the upstream URL: a keyed one carries the provider key.
    }
  }

  if (internalErrorAnswer) return json(internalErrorAnswer, 200);
  return json({ error: "EVM RPC unreachable" }, 502);
}

export const config = {
  runtime: "edge",
};
