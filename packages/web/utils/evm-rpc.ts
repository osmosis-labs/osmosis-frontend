import {
  EthereumChainInfo,
  EvmRpcTransportOptions,
  getEvmRpcTransportFromUrls,
} from "@osmosis-labs/utils";
import { type Address, createPublicClient } from "viem";
import { getTransactionReceipt } from "viem/actions";

/** This app's EVM RPC route (pages/api/evm-rpc), which forwards to the
 *  chain's keyed provider server-side. */
const EVM_RPC_PROXY_PATH = "/api/evm-rpc";

/**
 * Chain ids with a keyed provider configured (`EVM_RPC_URL_<chainId>`),
 * derived at build time in next.config.js. Only the ids are public; the URLs
 * stay on the server.
 */
const PROXIED_CHAIN_IDS = new Set(
  (process.env.NEXT_PUBLIC_EVM_RPC_PROXY_CHAIN_IDS ?? "")
    .split(",")
    .map((id) => Number(id.trim()))
    .filter((id) => Number.isInteger(id) && id > 0)
);

/**
 * RPC URLs for EVM reads the browser makes: the app's RPC route first when
 * the chain has a keyed provider, then the chain's public endpoints. The
 * public endpoints stay as a direct fallback so an outage of the route
 * itself doesn't take balances and receipt polling with it. Chains without
 * a provider skip the route, which would only forward to the same public
 * endpoints.
 */
export function getClientEvmRpcUrls(chain: {
  id: number;
  rpcUrls: { default: { http: readonly string[] } };
}): string[] {
  const publicUrls = [...chain.rpcUrls.default.http];
  if (!PROXIED_CHAIN_IDS.has(chain.id)) return publicUrls;

  // viem needs an absolute URL; outside the browser the path is kept as-is.
  const proxyUrl =
    typeof window === "undefined"
      ? `${EVM_RPC_PROXY_PATH}?chainId=${chain.id}`
      : new URL(
          `${EVM_RPC_PROXY_PATH}?chainId=${chain.id}`,
          window.location.origin
        ).toString();
  return [proxyUrl, ...publicUrls];
}

/** `getEvmRpcTransport` for browser calls, with the app's RPC route first
 *  where a keyed provider is configured. */
export function getClientEvmRpcTransport(
  chain: {
    id: number;
    rpcUrls: { default: { http: readonly string[] } };
  },
  opts?: EvmRpcTransportOptions
) {
  return getEvmRpcTransportFromUrls(getClientEvmRpcUrls(chain), opts);
}

/**
 * One-shot, provable outcome of a broadcast EVM transaction from its receipt,
 * for status tracking that outlives the signing flow (a receipt wait that
 * failed, or a transfer restored after a reload).
 *
 * - `success` / `reverted`: the receipt exists, with that status.
 * - `undefined`: nothing provable (not mined yet, dropped, unknown chain, or
 *   the RPC didn't answer). Callers must keep waiting, never treat it as a
 *   failure.
 */
export async function checkEvmReceiptOutcome({
  txHash,
  chainId,
}: {
  txHash: string;
  chainId: number;
}): Promise<"success" | "reverted" | undefined> {
  const chain = EthereumChainInfo.find((chain) => chain.id === chainId);
  if (!chain) return undefined;
  try {
    const receipt = await getTransactionReceipt(
      createPublicClient({ chain, transport: getClientEvmRpcTransport(chain) }),
      { hash: txHash as Address }
    );
    return receipt.status === "reverted" ? "reverted" : "success";
  } catch {
    return undefined; // not found or unanswered: undecided, not negative
  }
}
