import { BridgeEnvironment } from "../interface";

export const providerName = "Axelar" as const;

/** Maps Axelar chain id agruments => source chain ids.
 *  SourceChain (IDs) are used in ./source-chain-configs.ts::SourceChainConfigs{} as <asset>::<network>::id values.
 *  Axelar Chain IDs are accepted as arguments in Axelar's APIs.
 *  Mainnet Docs: https://docs.axelar.dev/dev/build/chain-names/mainnet
 *  Testnet Docs: https://docs.axelar.dev/dev/build/chain-names/testnet
 *  Testnet API: https://axelartest-lcd.quickapi.com/axelar/nexus/v1beta1/chains?status=1
 */
export const AxelarChainIds_SourceChainMap: (env: BridgeEnvironment) => {
  [axelarChainIds: string]: string | undefined;
} = (env) =>
  env === "testnet"
    ? {
        aurora: "Aurora Testnet",
        Avalanche: "Avalanche Fuji Testnet",
        binance: "BSC Testnet",
        "ethereum-2": "Goerli Testnet",
        Fantom: "Fantom Testnet",
        Moonbeam: "Moonbase Alpha",
        Polygon: "Mumbai",
        filecoin: "Filecoin Hyperspace",
      }
    : {
        Avalanche: "Avalanche",
        binance: "Binance Smart Chain",
        Ethereum: "Ethereum",
        Fantom: "Fantom",
        Moonbeam: "Moonbeam",
        Polygon: "Polygon",
        filecoin: "Filecoin",
        arbitrum: "Arbitrum",
      };

const TestnetCosmosChainIds_AxelarChainIds: Partial<Record<string, string>> = {
  "osmo-test-5": "osmosis-7",
};

const MainnetCosmosChainIds_AxelarChainIds: Partial<Record<string, string>> = {
  "osmosis-1": "osmosis",
};

/**
 * Maps Cosmos chain ids => Axelar chain ids.
 */
export const CosmosChainIds_AxelarChainIds: (
  env: BridgeEnvironment
) => Partial<Record<string, string>> = (env) =>
  env === "testnet"
    ? TestnetCosmosChainIds_AxelarChainIds
    : MainnetCosmosChainIds_AxelarChainIds;
