import { fallback, http } from "viem";
import {
  arbitrum,
  avalanche,
  avalancheFuji,
  base,
  blast,
  bsc,
  bscTestnet,
  Chain,
  fantom,
  fantomTestnet,
  filecoin,
  filecoinHyperspace,
  goerli,
  mainnet,
  moonbaseAlpha,
  moonbeam,
  optimism,
  polygon,
  polygonMumbai,
} from "viem/chains";

/**
 * Placeholder address for the native tokens like ETH, or AVAX. This is used by protocols to refer to the native token, in order,
 * to be handled similarly to other ERC20 tokens.
 */
export const NativeEVMTokenConstantAddress =
  "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE";

function mapChainInfo<Chain>({
  chain,
  clientChainId,
  color,
  relativeLogoUrl,
}: {
  chain: Chain;
  clientChainId: string;
  color: string;
  relativeLogoUrl: string;
}) {
  return {
    ...chain,
    clientChainId: clientChainId,
    color,
    relativeLogoUrl,
  };
}

/**
 * Replaces a viem chain's default RPC URLs. Order matters: the first URL is
 * primary and the rest are fallbacks (see `getEvmRpcTransport`).
 *
 * viem's defaults are a single URL per chain and some have been shut down or
 * put behind API keys without notice (polygon-rpc.com, rpc.ankr.com), which
 * silently zeroes balances on that chain. Every mainnet chain below therefore
 * lists at least one endpoint besides viem's default where one exists.
 *
 * URLs must be keyless (this list ships in the client bundle via wagmi) and
 * send CORS headers. Where available they must also support eth_estimateGas
 * with state overrides (the bridge quote flow relies on it) and answer that
 * method promptly; merkle was dropped from mainnet because its
 * eth_estimateGas hangs ~15s while other methods stay fast.
 */
function withRpcUrls<
  C extends { rpcUrls: { default: { http: readonly string[] } } },
>(chain: C, http: string[]): C {
  return {
    ...chain,
    rpcUrls: {
      ...chain.rpcUrls,
      default: { ...chain.rpcUrls.default, http },
    },
  };
}

export const EthereumChainInfo = [
  mapChainInfo({
    chain: withRpcUrls(mainnet, [
      "https://ethereum-rpc.publicnode.com",
      "https://evm-1.keplr.app",
      "https://eth.drpc.org",
    ]),
    clientChainId: "Ethereum Main Network",
    color: "#454973",
    relativeLogoUrl: "/networks/ethereum.svg",
  }),
  mapChainInfo({
    chain: goerli,
    clientChainId: "Goerli Test Network",
    color: "#454973",
    relativeLogoUrl: "/networks/ethereum.svg",
  }),
  mapChainInfo({
    chain: withRpcUrls(bsc, [
      "https://bsc-rpc.publicnode.com",
      "https://bsc-dataseed.bnbchain.org",
    ]),
    clientChainId: "Binance Smart Chain Mainnet",
    color: "#f3b90c",
    relativeLogoUrl: "/networks/binance.svg",
  }),
  mapChainInfo({
    chain: bscTestnet,
    clientChainId: "Binance Smart Chain Testnet",
    color: "#f3b90c",
    relativeLogoUrl: "/networks/binance.svg",
  }),
  mapChainInfo({
    chain: withRpcUrls(polygon, [
      "https://polygon-bor-rpc.publicnode.com",
      "https://polygon.drpc.org",
    ]),
    clientChainId: "Polygon Mainnet",
    color: "#8247E5",
    relativeLogoUrl: "/networks/polygon.svg",
  }),
  mapChainInfo({
    chain: polygonMumbai,
    clientChainId: "Mumbai",
    color: "#8247E5",
    relativeLogoUrl: "/networks/polygon.svg",
  }),
  // The only keyless Moonbeam endpoint that still answers. It serves
  // balances but not state-override gas estimates.
  mapChainInfo({
    chain: withRpcUrls(moonbeam, ["https://moonbeam.drpc.org"]),
    clientChainId: "Moonbeam Mainnet",
    color: "#FA047C",
    relativeLogoUrl: "/networks/moonbeam.svg",
  }),
  mapChainInfo({
    chain: moonbaseAlpha,
    clientChainId: "Moonbase Alpha",
    color: "#FA047C",
    relativeLogoUrl: "/networks/moonbeam.svg",
  }),
  // No keyless Fantom endpoint supports state-override gas estimates.
  mapChainInfo({
    chain: withRpcUrls(fantom, [
      "https://rpcapi.fantom.network",
      "https://fantom.drpc.org",
    ]),
    clientChainId: "Fantom Opera",
    color: "#1b6cfc",
    relativeLogoUrl: "/networks/fantom.svg",
  }),
  mapChainInfo({
    chain: fantomTestnet,
    clientChainId: "Fantom Testnet",
    color: "#1b6cfc",
    relativeLogoUrl: "/networks/fantom.svg",
  }),
  mapChainInfo({
    chain: avalancheFuji,
    clientChainId: "Avalanche Fuji Testnet",
    color: "#E84142",
    relativeLogoUrl: "/networks/avalanche.svg",
  }),
  mapChainInfo({
    chain: withRpcUrls(avalanche, [
      "https://api.avax.network/ext/bc/C/rpc",
      "https://avalanche-c-chain-rpc.publicnode.com",
      "https://avalanche.drpc.org",
    ]),
    clientChainId: "Avalanche C-Chain",
    color: "#E84142",
    relativeLogoUrl: "/networks/avalanche.svg",
  }),
  mapChainInfo({
    chain: withRpcUrls(arbitrum, [
      "https://arb1.arbitrum.io/rpc",
      "https://arbitrum-one-rpc.publicnode.com",
      "https://arbitrum.drpc.org",
    ]),
    clientChainId: "Arbitrum One",
    color: "#3D4A6B",
    relativeLogoUrl: "/networks/arbitrum.svg",
  }),
  // Filecoin's EVM RPC does not accept state overrides on any endpoint.
  mapChainInfo({
    chain: withRpcUrls(filecoin, [
      "https://api.node.glif.io/rpc/v1",
      "https://filecoin.drpc.org",
    ]),
    clientChainId: "Filecoin - Mainnet",
    color: "#0494fc",
    relativeLogoUrl: "/networks/filecoin.svg",
  }),
  mapChainInfo({
    chain: filecoinHyperspace,
    clientChainId: "Filecoin Hyperspace",
    color: "#0494fc",
    relativeLogoUrl: "/networks/filecoin.svg",
  }),
  mapChainInfo({
    chain: withRpcUrls(base as Chain, [
      "https://mainnet.base.org",
      "https://base-rpc.publicnode.com",
      "https://base.drpc.org",
    ]),
    clientChainId: "Base",
    color: "#0052FF",
    relativeLogoUrl: "/networks/base.svg",
  }),
  mapChainInfo({
    chain: withRpcUrls(blast as Chain, [
      "https://rpc.blast.io",
      "https://blast-rpc.publicnode.com",
    ]),
    clientChainId: "Blast",
    color: "#fcfc03",
    relativeLogoUrl: "/networks/blast.svg",
  }),
  mapChainInfo({
    chain: withRpcUrls(optimism as Chain, [
      "https://mainnet.optimism.io",
      "https://optimism-rpc.publicnode.com",
    ]),
    clientChainId: "Optimism",
    color: "#FF0420",
    relativeLogoUrl: "/networks/optimism.svg",
  }),
] as const;

/**
 * Builds a viem fallback transport from a chain's default RPC URLs.
 * Falls through each URL in order on failure.
 *
 * By default each attempt uses viem's timeout/retry behavior, which suits
 * long-lived client-side calls like waiting for a transaction receipt —
 * failing fast there mislabels an in-flight transaction as failed. Server-side
 * bridge quotes run under a 12s tRPC procedure timeout, where those same
 * defaults (10s timeout, 3 retries per transport plus fallback-level retries)
 * let one hanging endpoint consume the entire budget before the remaining
 * URLs are tried — those call sites should pass a short timeout and zero
 * retries.
 */
export function getEvmRpcTransport(
  chain: {
    rpcUrls: { default: { http: readonly string[] } };
  },
  opts?: EvmRpcTransportOptions
) {
  return getEvmRpcTransportFromUrls(chain.rpcUrls.default.http, opts);
}

export type EvmRpcTransportOptions = { timeout?: number; retryCount?: number };

/** `getEvmRpcTransport` over an explicit URL list, in preference order. */
export function getEvmRpcTransportFromUrls(
  urls: readonly string[],
  opts?: EvmRpcTransportOptions
) {
  return fallback(
    urls.map((url) => http(url, opts)),
    { retryCount: opts?.retryCount }
  );
}

/**
 * Keyed provider RPC URLs configured for a chain as `EVM_RPC_URL_<chainId>`
 * (comma-separated, in preference order). They carry API keys, so they are
 * server-only: never return them to the browser, and redact them from error
 * text that leaves the server (`redactConfiguredEvmRpcUrls`).
 *
 * Each variable is named literally because Edge and browser bundles only see
 * env vars referenced by name in source. In the browser all are undefined.
 */
export function getConfiguredEvmRpcUrls(chainId: number): string[] {
  const configured: Record<number, string | undefined> = {
    1: process.env.EVM_RPC_URL_1,
    10: process.env.EVM_RPC_URL_10,
    56: process.env.EVM_RPC_URL_56,
    137: process.env.EVM_RPC_URL_137,
    250: process.env.EVM_RPC_URL_250,
    314: process.env.EVM_RPC_URL_314,
    1284: process.env.EVM_RPC_URL_1284,
    8453: process.env.EVM_RPC_URL_8453,
    42161: process.env.EVM_RPC_URL_42161,
    43114: process.env.EVM_RPC_URL_43114,
    81457: process.env.EVM_RPC_URL_81457,
  };
  return (configured[chainId] ?? "")
    .split(",")
    .map((url) => url.trim())
    .filter(Boolean);
}

/**
 * Server-side RPC URLs for a chain: configured keyed providers first, then
 * the chain's public endpoints as fallbacks, so an exhausted free-tier quota
 * or a provider outage degrades to the public endpoints instead of failing.
 */
export function getServerEvmRpcUrls(chain: {
  id: number;
  rpcUrls: { default: { http: readonly string[] } };
}): string[] {
  return Array.from(
    new Set([
      ...getConfiguredEvmRpcUrls(chain.id),
      ...chain.rpcUrls.default.http,
    ])
  );
}

/** `getEvmRpcTransport` with configured keyed providers first. Server-only. */
export function getServerEvmRpcTransport(
  chain: {
    id: number;
    rpcUrls: { default: { http: readonly string[] } };
  },
  opts?: EvmRpcTransportOptions
) {
  return getEvmRpcTransportFromUrls(getServerEvmRpcUrls(chain), opts);
}

/**
 * Replaces any configured keyed RPC URL in `text` with its origin and a
 * placeholder. viem puts the request URL in its error messages, so error
 * text from a keyed transport would otherwise carry the API key. Matches by
 * origin so a key in the path or query is removed whatever follows it.
 */
export function redactConfiguredEvmRpcUrls(text: string): string {
  let redacted = text;
  for (const chainInfo of EthereumChainInfo) {
    for (const url of getConfiguredEvmRpcUrls(chainInfo.id)) {
      let origin: string;
      try {
        origin = new URL(url).origin;
      } catch {
        // An unparsable value is still a secret: remove it verbatim.
        redacted = redacted.split(url).join("<redacted RPC URL>");
        continue;
      }
      const escaped = origin.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      redacted = redacted.replace(
        new RegExp(`${escaped}[^\\s"'<>]*`, "g"),
        `${origin}/<redacted>`
      );
    }
  }
  return redacted;
}

export function getEvmExplorerUrl({
  hash,
  chainId,
}: {
  hash: string;
  chainId: number;
}) {
  const chain = EthereumChainInfo.find((chain) => chain.id === chainId);
  if (!chain) return undefined;

  const explorerUrl = chain.blockExplorers?.default.url;
  if (!explorerUrl) return undefined;

  return `${explorerUrl}/tx/${hash}`;
}
