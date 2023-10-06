import { SpriteIconId } from "~/config";
import { AxelarBridgeConfig } from "~/integrations/axelar/types";
import { WalletKey } from "~/integrations/wallets";

// Add to these types as more bridges are integrated

export type OriginBridgeInfo = {
  bridge: "axelar";
  wallets: WalletKey[];
} & AxelarBridgeConfig;

/** Human-displayable global source chain identifiers */
export type SourceChain =
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
  | "Arbitrum";

/** String literal identifiers for a source chain. */
export type SourceChainKey = SourceChain;

/** Maps eth client chainIDs => source chain ids.
 *
 *  ethClientChainIDs must be specified in ../ethereuem/types.ts::ChainNames{}
 *  to map the name to a chainID, which is in turn used to add the network to
 *  EVM-compatible wallets, like Metamask.
 */
export const EthClientChainIds_SourceChainMap: {
  [ethClientChainIds: string]: SourceChain;
} = {
  "Aurora Testnet": "Aurora Testnet",
  "Avalanche Fuji Testnet": "Avalanche Fuji Testnet",
  "Binance Smart Chain Testnet": "BSC Testnet",
  "Goerli Test Network": "Goerli Testnet",
  "Fantom Testnet": "Fantom Testnet",
  "Moonbase Alpha": "Moonbase Alpha",
  Mumbai: "Mumbai",
  "Filecoin Hyperspace": "Filecoin Hyperspace",
  "Avalanche C-Chain": "Avalanche",
  "Binance Smart Chain Mainnet": "Binance Smart Chain",
  "Ethereum Main Network": "Ethereum",
  "Fantom Opera": "Fantom",
  "Moonbeam Mainnet": "Moonbeam",
  "Polygon Mainnet": "Polygon",
  "Filecoin - Mainnet": "Filecoin",
  "Arbitrum One": "Arbitrum",
};

const createEthereumChainInfo = <
  Dict extends Partial<
    Record<
      SourceChain,
      {
        chainId: number;
        chainName: SourceChain;
        clientChainId: string;
      }
    >
  >
>(
  dict: Dict
) => dict;

export const EthereumChainInfo = createEthereumChainInfo({
  Ethereum: {
    chainId: 1,
    chainName: "Ethereum",
    clientChainId: "Ethereum Main Network",
  },
  "Goerli Testnet": {
    chainId: 5,
    chainName: "Goerli Testnet",
    clientChainId: "Goerli Test Network",
  },
  "Binance Smart Chain": {
    chainId: 56,
    chainName: "Binance Smart Chain",
    clientChainId: "Binance Smart Chain Mainnet",
  },
  "BSC Testnet": {
    chainId: 97,
    chainName: "BSC Testnet",
    clientChainId: "Binance Smart Chain Testnet",
  },
  Polygon: {
    chainId: 137,
    chainName: "Polygon",
    clientChainId: "Polygon Mainnet",
  },
  Mumbai: {
    chainId: 80001,
    chainName: "Mumbai",
    clientChainId: "Mumbai",
  },
  Moonbeam: {
    chainId: 1284,
    chainName: "Moonbeam",
    clientChainId: "Moonbeam Mainnet",
  },
  "Moonbase Alpha": {
    chainId: 1287,
    chainName: "Moonbase Alpha",
    clientChainId: "Moonbase Alpha",
  },
  Fantom: {
    chainId: 250,
    chainName: "Fantom",
    clientChainId: "Fantom Opera",
  },
  "Fantom Testnet": {
    chainId: 4002,
    chainName: "Fantom Testnet",
    clientChainId: "Fantom Testnet",
  },
  "Avalanche Fuji Testnet": {
    chainId: 43113,
    chainName: "Avalanche Fuji Testnet",
    clientChainId: "Avalanche Fuji Testnet",
  },
  Avalanche: {
    chainId: 43114,
    chainName: "Avalanche",
    clientChainId: "Avalanche C-Chain",
  },
  Arbitrum: {
    chainId: 42161,
    chainName: "Arbitrum",
    clientChainId: "Arbitrum One",
  },
  Filecoin: {
    chainId: 461,
    chainName: "Filecoin",
    clientChainId: "Filecoin - Mainnet",
  },
  "Filecoin Hyperspace": {
    chainId: 3141,
    chainName: "Filecoin Hyperspace",
    clientChainId: "Filecoin Hyperspace",
  },
});

// Fiat on/off ramps
export type FiatRampKey = "kado" | "transak" | "layerswapcoinbase";
export const FiatRampDisplayInfos: Record<
  FiatRampKey,
  {
    rampKey: FiatRampKey;
    iconUrl: string;
    displayName: string;
    logoId?: SpriteIconId;
  }
> = {
  kado: {
    rampKey: "kado",
    iconUrl: "/logos/kado.svg",
    displayName: "Kado",
    logoId: "kado-logo",
  },
  transak: {
    rampKey: "transak",
    iconUrl: "/logos/transak.svg",
    displayName: "Transak",
    logoId: "transak-logo",
  },
  layerswapcoinbase: {
    rampKey: "layerswapcoinbase",
    iconUrl: "/logos/coinbase.svg",
    displayName: "Coinbase",
  },
};
