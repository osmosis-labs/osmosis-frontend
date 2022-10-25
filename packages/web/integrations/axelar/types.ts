export interface AxelarBridgeConfig {
  /** Currently just via deposit address, future could be gateway contract call. */
  method: "deposit-address";
  /** Chains that can fungibly source this asset.
   *
   *  See this FigJam for axlUSDC case:
   *  https://www.figma.com/file/utRjpBIvD7sRm31vxif7hF/Bridge-Integration-Diagram?node-id=340%3A935
   */
  sourceChains: SourceChainConfig[];
  /** Default source chain to be selected. Defaults to first in `sourceChains` if left `undefined`. */
  defaultSourceChainId?: SourceChain;
  /** Ex: `uusdc`. NOTE: Will get currency info from `originCurrency` on the IBC balance (from registrar).
   *  See: https://docs.axelar.dev/resources/mainnet#assets
   */
}

/** See: https://docs.axelar.dev/dev/build/chain-names/mainnet
 *  Testnet: https://axelartest-lcd.quickapi.com/axelar/nexus/v1beta1/chains?status=1
 */
export type SourceChain =
  | "Ethereum"
  | "Ropsten Test Network"
  | "Avalanche"
  | "Fantom"
  | "Polygon"
  | "Moonbeam"
  | "Moonbase Alpha"
  | "Binance";

/** Maps eth client chainIDs => axelar chain ids.
 *
 *  ethClientChainIDs must be specified in ../ethereuem/types.ts::ChainNames{} to map the name to a chainID, which is in turn used to add the network to EVM-compatible wallets, like Metamask.
 *
 * AxelarChainIds must be specified in SourceChain{} and are used in ./source-chain-configs.ts::SourceChainConfigs{} as <asset>::<network>::id values.
 *
 *  Values not included as keys are assumed to be the same across chainlist and Axelar.
 */
export const EthClientChainIds_AxelarChainIdsMap: {
  [ethClientChainIds: string]: SourceChain;
} = {
  "Avalanche C-Chain": "Avalanche",
  "Binance Smart Chain": "Binance",
  "Fantom Opera": "Fantom",
};

export type SourceChainConfig = {
  /** Axelar-defined identifier. */
  id: SourceChain;
  /** Address of origin ERC20 token for that origin chain. Leave blank to prefer native ETH currency if `id` is not a Cosmos chain in `ChainInfo`.
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
  
  /** Amount of Axelar transfer fee in `originCurrency`.
  *  TODO: use `useTransferFeeQuery` should fees become dynamic and once APIs become production ready.
  *  See calculator tool on Axelar docs to get current fee constants: https://docs.axelar.dev/resources/mainnet#cross-chain-relayer-gas-fee.
  */
  transferFeeMinAmount: string;
  
};
