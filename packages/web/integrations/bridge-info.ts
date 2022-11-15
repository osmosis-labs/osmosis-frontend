import { AxelarBridgeConfig } from "./axelar/types";
import { WalletKey } from "./wallets";

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
  | "Mumbai";

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
  "Avalanche C-Chain": "Avalanche",
  "Binance Smart Chain Mainnet": "Binance Smart Chain",
  "Ethereum Main Network": "Ethereum",
  "Fantom Opera": "Fantom",
  "Moonbeam Mainnet": "Moonbeam",
  "Polygon Mainnet": "Polygon",
};

// Fiat on/off ramps

export type FiatRampKey = "kado" | "transak";
export const FiatRampDisplayInfos: {
  [key: string]: { iconUrl: string; displayName: string };
} = {
  kado: {
    iconUrl: "/logos/kado.svg",
    displayName: "Kado",
  },
  transak: {
    iconUrl: "/logos/transak.svg",
    displayName: "Transak",
  },
};
