import { SpriteIconId } from "~/config";
import { AxelarBridgeConfig } from "~/integrations/bridges/axelar/types";
import { WalletKey } from "~/integrations/wallets";

// Add to these types as more bridges are integrated

export type OriginBridgeInfo = {
  bridge: "axelar" | "nomic";
  wallets: WalletKey[];
} & AxelarBridgeConfig;

/** Human-displayable global source chain identifiers */
export type SourceChain =
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
        rpcUrls: string[];
        nativeCurrency: {
          name: string;
          symbol: string;
          decimals: number;
        };
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
    rpcUrls: ["https://ethereum.publicnode.com"],
    nativeCurrency: {
      name: "Ether",
      symbol: "ETH",
      decimals: 18,
    },
  },
  "Goerli Testnet": {
    chainId: 5,
    chainName: "Goerli Testnet",
    clientChainId: "Goerli Test Network",
    rpcUrls: ["https://optimism-goerli.publicnode.com"],
    nativeCurrency: {
      name: "Goerli Ether",
      symbol: "ETH",
      decimals: 18,
    },
  },
  "Binance Smart Chain": {
    chainId: 56,
    chainName: "Binance Smart Chain",
    clientChainId: "Binance Smart Chain Mainnet",
    rpcUrls: ["https://bsc-dataseed.binance.org/"],
    nativeCurrency: {
      name: "Binance Chain Native Token",
      symbol: "BNB",
      decimals: 18,
    },
  },
  "BSC Testnet": {
    chainId: 97,
    chainName: "BSC Testnet",
    clientChainId: "Binance Smart Chain Testnet",
    rpcUrls: ["https://binance.llamarpc.com"],
    nativeCurrency: {
      name: "Binance Chain Native Token",
      symbol: "BNB",
      decimals: 18,
    },
  },
  Polygon: {
    chainId: 137,
    chainName: "Polygon",
    clientChainId: "Polygon Mainnet",
    rpcUrls: ["https://polygon-rpc.com/"],
    nativeCurrency: {
      name: "Matic",
      symbol: "MATIC",
      decimals: 18,
    },
  },
  Mumbai: {
    chainId: 80001,
    chainName: "Mumbai",
    clientChainId: "Mumbai",
    rpcUrls: ["https://polygon-mumbai-bor.publicnode.com"],
    nativeCurrency: {
      name: "Matic",
      symbol: "MATIC",
      decimals: 18,
    },
  },
  Moonbeam: {
    chainId: 1284,
    chainName: "Moonbeam",
    clientChainId: "Moonbeam Mainnet",
    rpcUrls: ["https://moonbeam.publicnode.com"],
    nativeCurrency: {
      name: "Moonbeam",
      symbol: "GLMR",
      decimals: 18,
    },
  },
  "Moonbase Alpha": {
    chainId: 1287,
    chainName: "Moonbase Alpha",
    clientChainId: "Moonbase Alpha",
    rpcUrls: ["https://moonbase-alpha.public.blastapi.io"],
    nativeCurrency: {
      name: "Moonbase Alpha",
      symbol: "DEV",
      decimals: 18,
    },
  },
  Fantom: {
    chainId: 250,
    chainName: "Fantom",
    clientChainId: "Fantom Opera",
    rpcUrls: ["https://fantom.publicnode.com"],
    nativeCurrency: {
      name: "Fantom",
      symbol: "FTM",
      decimals: 18,
    },
  },
  "Fantom Testnet": {
    chainId: 4002,
    chainName: "Fantom Testnet",
    clientChainId: "Fantom Testnet",
    rpcUrls: ["https://fantom-testnet.publicnode.com"],
    nativeCurrency: {
      name: "Fantom",
      symbol: "FTM",
      decimals: 18,
    },
  },
  "Avalanche Fuji Testnet": {
    chainId: 43113,
    chainName: "Avalanche Fuji Testnet",
    clientChainId: "Avalanche Fuji Testnet",
    rpcUrls: ["https://api.avax-test.network/ext/bc/C/rpc"],
    nativeCurrency: {
      name: "Avalanche",
      symbol: "AVAX",
      decimals: 18,
    },
  },
  Avalanche: {
    chainId: 43114,
    chainName: "Avalanche",
    clientChainId: "Avalanche C-Chain",
    rpcUrls: ["https://api.avax.network/ext/bc/C/rpc"],
    nativeCurrency: {
      name: "Avalanche",
      symbol: "AVAX",
      decimals: 18,
    },
  },
  Arbitrum: {
    chainId: 42161,
    chainName: "Arbitrum",
    clientChainId: "Arbitrum One",
    rpcUrls: ["https://arbitrum-one.publicnode.com"],
    nativeCurrency: {
      name: "Arbitrum",
      symbol: "ETH",
      decimals: 18,
    },
  },
  Filecoin: {
    chainId: 461,
    chainName: "Filecoin",
    clientChainId: "Filecoin - Mainnet",
    rpcUrls: ["https://rpc.ankr.com/filecoin"],
    nativeCurrency: {
      name: "Filecoin",
      symbol: "FIL",
      decimals: 18,
    },
  },
  "Filecoin Hyperspace": {
    chainId: 3141,
    chainName: "Filecoin Hyperspace",
    clientChainId: "Filecoin Hyperspace",
    rpcUrls: [""],
    nativeCurrency: {
      name: "Filecoin",
      symbol: "FIL",
      decimals: 18,
    },
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
    iconUrl: `${process.env.NEXT_PUBLIC_BASEPATH}/logos/kado.svg`,
    displayName: "Kado",
    logoId: "kado-logo",
  },
  transak: {
    rampKey: "transak",
    iconUrl: `${process.env.NEXT_PUBLIC_BASEPATH}/logos/transak.svg`,
    displayName: "Transak",
    logoId: "transak-logo",
  },
  layerswapcoinbase: {
    rampKey: "layerswapcoinbase",
    iconUrl: `${process.env.NEXT_PUBLIC_BASEPATH}/logos/coinbase.svg`,
    displayName: "Coinbase",
  },
};
