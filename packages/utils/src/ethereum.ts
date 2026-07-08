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

export const EthereumChainInfo = [
  // Override viem's default mainnet RPC (eth.merkle.io) with more reliable
  // public endpoints. Order matters: first URL is primary. Every URL must
  // support eth_estimateGas with state overrides (the bridge quote flow
  // relies on it) and answer that method promptly — merkle was dropped
  // because its eth_estimateGas hangs ~15s while other methods stay fast.
  mapChainInfo({
    chain: {
      ...mainnet,
      rpcUrls: {
        ...mainnet.rpcUrls,
        default: {
          ...mainnet.rpcUrls.default,
          http: [
            "https://ethereum-rpc.publicnode.com",
            "https://evm-1.keplr.app",
            "https://eth.drpc.org",
          ],
        },
      },
    },
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
    chain: bsc,
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
    chain: polygon,
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
  mapChainInfo({
    chain: moonbeam,
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
  mapChainInfo({
    chain: fantom,
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
    chain: avalanche,
    clientChainId: "Avalanche C-Chain",
    color: "#E84142",
    relativeLogoUrl: "/networks/avalanche.svg",
  }),
  mapChainInfo({
    chain: arbitrum,
    clientChainId: "Arbitrum One",
    color: "#3D4A6B",
    relativeLogoUrl: "/networks/arbitrum.svg",
  }),
  mapChainInfo({
    chain: filecoin,
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
    chain: base as Chain,
    clientChainId: "Base",
    color: "#0052FF",
    relativeLogoUrl: "/networks/base.svg",
  }),
  mapChainInfo({
    chain: blast as Chain,
    clientChainId: "Blast",
    color: "#fcfc03",
    relativeLogoUrl: "/networks/blast.svg",
  }),
  mapChainInfo({
    chain: optimism as Chain,
    clientChainId: "Optimism",
    color: "#FF0420",
    relativeLogoUrl: "/networks/optimism.svg",
  }),
] as const;

/**
 * Builds a viem fallback transport from a chain's default RPC URLs.
 * Falls through each URL in order on failure.
 *
 * Each attempt is bounded (short timeout, no retries) so a degraded RPC
 * can't stall the chain: server-side bridge quotes run under a 12s tRPC
 * procedure timeout, and viem's defaults (10s timeout, 3 retries per
 * transport plus fallback-level retries) let one hanging endpoint consume
 * the entire budget before the remaining URLs are tried.
 */
export function getEvmRpcTransport(chain: {
  rpcUrls: { default: { http: readonly string[] } };
}) {
  return fallback(
    chain.rpcUrls.default.http.map((url) =>
      http(url, { timeout: 3_000, retryCount: 0 })
    ),
    { retryCount: 0 }
  );
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
