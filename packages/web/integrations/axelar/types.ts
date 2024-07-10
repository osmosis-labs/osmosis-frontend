import type { SourceChainTokenConfig } from "@osmosis-labs/bridge";
import { AxelarSourceChain } from "@osmosis-labs/utils";

import { IS_TESTNET } from "~/config";

export interface AxelarBridgeConfig {
  /** Currently just via deposit address, future could be gateway contract call. */
  method: "deposit-address";
  /** Chains that can fungibly source this asset.
   *
   *  See this FigJam for axlUSDC case:
   *  https://www.figma.com/file/utRjpBIvD7sRm31vxif7hF/Bridge-Integration-Diagram?node-id=340%3A935
   */
  sourceChainTokens: SourceChainTokenConfig[];
  /** Default source chain to be selected. Defaults to first in `sourceChains` if left `undefined`. */
  defaultSourceChainId?: AxelarSourceChain;
  /** Ex: `uusdc`. NOTE: Will get currency info from `originCurrency` on the IBC balance (from registrar).
   *  See: https://docs.axelar.dev/resources/mainnet#assets
   */

  /** URL config for users to conveniently swap the native asset for the wrapped version. */
  wrapAssetConfig?: {
    url: string;
    fromDenom: string;
    toDenom: string;
    platformName: string;
  };
}

/** Maps Axelar chain id agruments => source chain ids.
 *  SourceChain (IDs) are used in ./source-chain-configs.ts::SourceChainConfigs{} as <asset>::<network>::id values.
 *  Axelar Chain IDs are accepted as arguments in Axelar's APIs.
 *  Mainnet Docs: https://docs.axelar.dev/dev/build/chain-names/mainnet
 *  Testnet Docs: https://docs.axelar.dev/dev/build/chain-names/testnet
 *  Testnet API: https://axelartest-lcd.quickapi.com/axelar/nexus/v1beta1/chains?status=1
 */
export const AxelarChainIds_SourceChainMap: {
  [axelarChainIds: string]: AxelarSourceChain;
} = IS_TESTNET
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
      base: "Base",
    };

/** Maps eth client chainIDs => source chain ids.
 *
 *  ethClientChainIDs must be specified in ../ethereuem/types.ts::ChainNames{}
 *  to map the name to a chainID, which is in turn used to add the network to
 *  EVM-compatible wallets, like Metamask.
 */
export const EthClientChainIds_SourceChainMap: {
  [ethClientChainIds: string]: AxelarSourceChain;
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
  Base: "Base",
};
