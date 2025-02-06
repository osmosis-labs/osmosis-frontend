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
  mapChainInfo({
    chain: mainnet,
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
