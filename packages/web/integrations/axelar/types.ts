import { SourceChain } from "../bridge-info";

export interface AxelarBridgeConfig {
  /** Currently just via deposit address, future could be gateway contract call. */
  method: "deposit-address" | "gateway-contract-call";
  /** Chains that can fungibly source this asset.
   *
   *  See this FigJam for axlUSDC case:
   *  https://www.figma.com/file/utRjpBIvD7sRm31vxif7hF/Bridge-Integration-Diagram?node-id=340%3A935
   */
  sourceChains: TokenSourceChainConfig[];
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

export type TokenSourceChainConfig = {
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
