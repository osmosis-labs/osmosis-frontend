import { apiClient } from "@osmosis-labs/utils";

/**
 * Solana RPC endpoints for server-side reads, in preference order.
 *
 * `SOLANA_RPC_URL` should be a production RPC provider: Solana documents
 * its public mainnet-beta endpoint as rate-limited and unsuitable for
 * production traffic. The public endpoint is kept only as a fallback so
 * development works without configuration. publicnode is deliberately not
 * listed: it rejects the indexed token-account queries balances depend on
 * ("Indexed requests require a personal token").
 */
export function getSolanaRpcUrls(): string[] {
  const configured = process.env.SOLANA_RPC_URL?.trim();
  return [
    ...(configured ? [configured] : []),
    "https://api.mainnet-beta.solana.com",
  ];
}

/** Calls a Solana JSON-RPC method, trying each endpoint in order. Throws
 *  the last error when none answers, so callers never read a failure as an
 *  empty result. */
export async function solanaRpc<T>(
  method: string,
  params: unknown[],
  rpcUrls: string[] = getSolanaRpcUrls()
): Promise<T> {
  let lastError: unknown = new Error("No Solana RPC configured");
  for (const rpc of rpcUrls) {
    try {
      // JSON-RPC reports method errors inside a 200 response, so apiClient
      // (which throws on non-2xx) is checked for `error` as well.
      const json = await apiClient<{
        error?: { message?: string };
        result?: T;
      }>(rpc, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ jsonrpc: "2.0", id: 1, method, params }),
      });
      if (json.error) {
        throw new Error(`Solana RPC ${method} failed: ${json.error.message}`);
      }
      return json.result as T;
    } catch (e) {
      lastError = e;
    }
  }
  throw lastError;
}

/**
 * The serialized message inside a base64 Solana transaction, as
 * `getFeeForMessage` expects it. A serialized transaction is a compact-u16
 * signature count, that many 64-byte signatures, then the message, so the
 * message can be sliced out without a Solana SDK.
 */
export function solanaMessageFromTxBase64(txBase64: string): string {
  const bytes = Buffer.from(txBase64, "base64");
  // compact-u16: 7 bits per byte, high bit set on every byte but the last
  let signatureCount = 0;
  let offset = 0;
  for (let shift = 0; ; shift += 7) {
    if (offset >= bytes.length || shift > 14) {
      throw new Error("Malformed Solana transaction: bad signature count");
    }
    const byte = bytes[offset++];
    signatureCount |= (byte & 0x7f) << shift;
    if ((byte & 0x80) === 0) break;
  }
  const messageStart = offset + signatureCount * 64;
  if (messageStart >= bytes.length) {
    throw new Error("Malformed Solana transaction: no message");
  }
  return bytes.subarray(messageStart).toString("base64");
}

/**
 * The network fee, in lamports, the cluster will charge to land this exact
 * transaction (signature fees plus any priority fee its compute-budget
 * instructions set). Returns undefined when the node cannot price it, e.g.
 * the blockhash is no longer valid.
 *
 * This is the fee only. Accounts the transaction creates also need their
 * rent deposit, which it does not include, so callers should still
 * preflight the SOL balance before signing rather than treat this as the
 * total SOL required.
 */
export async function getSolanaTxFeeLamports(
  txBase64: string,
  rpcUrls?: string[]
): Promise<bigint | undefined> {
  const result = await solanaRpc<{ value: number | null }>(
    "getFeeForMessage",
    [solanaMessageFromTxBase64(txBase64), { commitment: "confirmed" }],
    rpcUrls
  );
  return result?.value == null ? undefined : BigInt(result.value);
}
