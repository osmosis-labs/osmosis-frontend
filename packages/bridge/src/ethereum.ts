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
} from "viem/chains";

import { SourceChain } from "./chain";

// TODO maybe we can use EVM chain ID (numeric) or ethereum chain registry
const createEthereumChainInfo = <
  Dict extends Partial<
    Record<
      SourceChain,
      Chain & {
        chainName: SourceChain;
        clientChainId: string;
      }
    >
  >
>(
  dict: Dict
) => dict;

const mapChainInfo = ({
  chain,
  axelarChainName: chainName,
  clientChainId,
}: {
  chain: Chain;
  axelarChainName: SourceChain;
  clientChainId: string;
}) => ({
  ...chain,
  chainName: chainName,
  clientChainId: clientChainId,
});

export const EthereumChainInfo = createEthereumChainInfo({
  Ethereum: mapChainInfo({
    chain: mainnet,
    axelarChainName: "Ethereum",
    clientChainId: "Ethereum Main Network",
  }),
  "Goerli Testnet": mapChainInfo({
    chain: goerli,
    axelarChainName: "Goerli Testnet",
    clientChainId: "Goerli Test Network",
  }),
  "Binance Smart Chain": mapChainInfo({
    chain: bsc,
    axelarChainName: "Binance Smart Chain",
    clientChainId: "Binance Smart Chain Mainnet",
  }),
  "BSC Testnet": mapChainInfo({
    chain: bscTestnet,
    axelarChainName: "BSC Testnet",
    clientChainId: "Binance Smart Chain Testnet",
  }),
  Polygon: mapChainInfo({
    chain: polygon,
    axelarChainName: "Polygon",
    clientChainId: "Polygon Mainnet",
  }),
  Mumbai: mapChainInfo({
    chain: polygonMumbai,
    axelarChainName: "Mumbai",
    clientChainId: "Mumbai",
  }),
  Moonbeam: mapChainInfo({
    chain: moonbeam,
    axelarChainName: "Moonbeam",
    clientChainId: "Moonbeam Mainnet",
  }),
  "Moonbase Alpha": mapChainInfo({
    chain: moonbaseAlpha,
    axelarChainName: "Moonbase Alpha",
    clientChainId: "Moonbase Alpha",
  }),
  Fantom: mapChainInfo({
    chain: fantom,
    axelarChainName: "Fantom",
    clientChainId: "Fantom Opera",
  }),
  "Fantom Testnet": mapChainInfo({
    chain: fantomTestnet,
    axelarChainName: "Fantom Testnet",
    clientChainId: "Fantom Testnet",
  }),
  "Avalanche Fuji Testnet": mapChainInfo({
    chain: avalancheFuji,
    axelarChainName: "Avalanche Fuji Testnet",
    clientChainId: "Avalanche Fuji Testnet",
  }),
  Avalanche: mapChainInfo({
    chain: avalanche,
    axelarChainName: "Avalanche",
    clientChainId: "Avalanche C-Chain",
  }),
  Arbitrum: mapChainInfo({
    chain: arbitrum,
    axelarChainName: "Arbitrum",
    clientChainId: "Arbitrum One",
  }),
  Filecoin: mapChainInfo({
    chain: filecoin,
    axelarChainName: "Filecoin",
    clientChainId: "Filecoin - Mainnet",
  }),
  "Filecoin Hyperspace": mapChainInfo({
    chain: filecoinHyperspace,
    axelarChainName: "Filecoin Hyperspace",
    clientChainId: "Filecoin Hyperspace",
  }),
});

/**
 * Placeholder address for the native tokens like ETH, or AVAX. This is used by protocols to refer to the native token, in order,
 * to be handled similarly to other ERC20 tokens.
 */
export const NativeEVMTokenConstantAddress =
  "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE";
