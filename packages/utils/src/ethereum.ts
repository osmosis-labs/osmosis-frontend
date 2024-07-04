import {
  arbitrum,
  avalanche,
  avalancheFuji,
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
  polygon,
  polygonMumbai,
  base,
  baseSepolia,
} from "viem/chains";

/**
 * Placeholder address for the native tokens like ETH, or AVAX. This is used by protocols to refer to the native token, in order,
 * to be handled similarly to other ERC20 tokens.
 */
export const NativeEVMTokenConstantAddress =
  "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE";

/** Human-displayable global source chain identifiers.
 *  TODO: use global chain IDs instead of display names as keys
 *
 * @deprecated
 */
export type AxelarSourceChain =
  | "Bitcoin"
  | "Bitcoin Testnet"
  | "Aurora Testnet"
  | "Avalanche"
  | "Avalanche Fuji Testnet"
  | "Binance Smart Chain"
  | "BSC Testnet"
  | "Ethereum"
  | "Goerli Testnet"
  | "Fantom"
  | "Fantom Testnet"
  | "Moonbeam"
  | "Moonbase Alpha"
  | "Polygon"
  | "Mumbai"
  | "Filecoin"
  | "Filecoin Hyperspace"
  | "Arbitrum"
  | "Arbitrum Sepolia Testnet"
  | "Base"
  | "Base Sepolia Testnet";

// TODO: maybe we can use EVM chain ID (numeric) or ethereum chain registry
const createEthereumChainInfo = <
  Dict extends Partial<
    Record<
      AxelarSourceChain,
      Chain & {
        chainName: AxelarSourceChain;
        clientChainId: string;
      }
    >
  >
>(
  dict: Dict
) => dict;

function mapChainInfo<WagmiChain>({
  chain,
  axelarChainName: chainName,
  clientChainId,
  color,
  relativeLogoUrl,
}: {
  chain: WagmiChain;
  axelarChainName: AxelarSourceChain;
  clientChainId: string;
  color: string;
  relativeLogoUrl: string;
}) {
  return {
    ...chain,
    chainName: chainName,
    clientChainId: clientChainId,
    color,
    relativeLogoUrl,
  };
}

export const EthereumChainInfo = createEthereumChainInfo({
  Ethereum: mapChainInfo({
    chain: mainnet,
    axelarChainName: "Ethereum",
    clientChainId: "Ethereum Main Network",
    color: "#454973",
    relativeLogoUrl: "/networks/ethereum.svg",
  }),
  "Goerli Testnet": mapChainInfo({
    chain: goerli,
    axelarChainName: "Goerli Testnet",
    clientChainId: "Goerli Test Network",
    color: "#454973",
    relativeLogoUrl: "/networks/ethereum.svg",
  }),
  "Binance Smart Chain": mapChainInfo({
    chain: bsc,
    axelarChainName: "Binance Smart Chain",
    clientChainId: "Binance Smart Chain Mainnet",
    color: "#f3b90c",
    relativeLogoUrl: "/networks/binance.svg",
  }),
  "BSC Testnet": mapChainInfo({
    chain: bscTestnet,
    axelarChainName: "BSC Testnet",
    clientChainId: "Binance Smart Chain Testnet",
    color: "#f3b90c",
    relativeLogoUrl: "/networks/binance.svg",
  }),
  Polygon: mapChainInfo({
    chain: polygon,
    axelarChainName: "Polygon",
    clientChainId: "Polygon Mainnet",
    color: "#8247E5",
    relativeLogoUrl: "/networks/polygon.svg",
  }),
  Mumbai: mapChainInfo({
    chain: polygonMumbai,
    axelarChainName: "Mumbai",
    clientChainId: "Mumbai",
    color: "#8247E5",
    relativeLogoUrl: "/networks/polygon.svg",
  }),
  Moonbeam: mapChainInfo({
    chain: moonbeam,
    axelarChainName: "Moonbeam",
    clientChainId: "Moonbeam Mainnet",
    color: "#FA047C",
    relativeLogoUrl: "/networks/moonbeam.svg",
  }),
  "Moonbase Alpha": mapChainInfo({
    chain: moonbaseAlpha,
    axelarChainName: "Moonbase Alpha",
    clientChainId: "Moonbase Alpha",
    color: "#FA047C",
    relativeLogoUrl: "/networks/moonbeam.svg",
  }),
  Fantom: mapChainInfo({
    chain: fantom,
    axelarChainName: "Fantom",
    clientChainId: "Fantom Opera",
    color: "#1b6cfc",
    relativeLogoUrl: "/networks/fantom.svg",
  }),
  "Fantom Testnet": mapChainInfo({
    chain: fantomTestnet,
    axelarChainName: "Fantom Testnet",
    clientChainId: "Fantom Testnet",
    color: "#1b6cfc",
    relativeLogoUrl: "/networks/fantom.svg",
  }),
  "Avalanche Fuji Testnet": mapChainInfo({
    chain: avalancheFuji,
    axelarChainName: "Avalanche Fuji Testnet",
    clientChainId: "Avalanche Fuji Testnet",
    color: "#E84142",
    relativeLogoUrl: "/networks/avalanche.svg",
  }),
  Avalanche: mapChainInfo({
    chain: avalanche,
    axelarChainName: "Avalanche",
    clientChainId: "Avalanche C-Chain",
    color: "#E84142",
    relativeLogoUrl: "/networks/avalanche.svg",
  }),
  Arbitrum: mapChainInfo({
    chain: arbitrum,
    axelarChainName: "Arbitrum",
    clientChainId: "Arbitrum One",
    color: "#3D4A6B",
    relativeLogoUrl: "/networks/arbitrum.svg",
  }),
  Filecoin: mapChainInfo({
    chain: filecoin,
    axelarChainName: "Filecoin",
    clientChainId: "Filecoin - Mainnet",
    color: "#0494fc",
    relativeLogoUrl: "/networks/filecoin.svg",
  }),
  "Filecoin Hyperspace": mapChainInfo({
    chain: filecoinHyperspace,
    axelarChainName: "Filecoin Hyperspace",
    clientChainId: "Filecoin Hyperspace",
    color: "#0494fc",
    relativeLogoUrl: "/networks/filecoin.svg",
  }),
  Base: mapChainInfo({
    chain: base,
    axelarChainName: "Base",
    clientChainId: "Base",
    color: "#0e76fd",
    relativeLogoUrl: "/networks/base.svg",
  }),
});
