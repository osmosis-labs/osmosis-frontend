import { SourceChain } from "../bridge-info";

const IS_TESTNET = process.env.NEXT_PUBLIC_IS_TESTNET === "true";

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
  defaultSourceChainId?: SourceChain;
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
  [axelarChainIds: string]: SourceChain;
} = IS_TESTNET
  ? {
      aurora: "Aurora Testnet",
      Avalanche: "Avalanche Fuji Testnet",
      binance: "BSC Testnet",
      "ethereum-2": "Goerli Testnet",
      Fantom: "Fantom Testnet",
      Moonbeam: "Moonbase Alpha",
      Polygon: "Mumbai",
    }
  : {
      Avalanche: "Avalanche",
      binance: "Binance Smart Chain",
      Ethereum: "Ethereum",
      Fantom: "Fantom",
      Moonbeam: "Moonbeam",
      Polygon: "Polygon",
    };

export type SourceChainTokenConfig = {
  /** Source Chain identifier. */
  id: SourceChain;

  /** Address of origin ERC20 token for that origin chain. Leave blank to
   *  prefer native ETH currency if `id` is not a Cosmos chain in `ChainInfo`.
   */
  erc20ContractAddress?: string;

  /** For IBC transfer from CosmosCounterparty<->via Axelar<->Osmosis */
  ibcConfig?: {
    /** on cosmos counterparty */
    sourceChannelId: string;
    /** on Axelar */
    destChannelId: string;
  };

  logoUrl: string;
};
