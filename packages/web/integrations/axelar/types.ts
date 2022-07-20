export interface AxelarBridgeConfig {
  /** Currently just via deposit address, future could be gateway contract call. */
  method: "deposit-address";
  /** Chains that can fungibly source this asset.
   *
   *  See this FigJam for axlUSDC case:
   *  https://www.figma.com/file/utRjpBIvD7sRm31vxif7hF/Bridge-Integration-Diagram?node-id=340%3A935
   */
  sourceChains: {
    id: SourceChain;
    /** Address of origin ERC20 token for that origin chain. Leave blank to prefer native ETH currency if `id` is not a Cosmos chain in `ChainInfo`.
     */
    erc20ContractAddress?: string;
  }[];
  /** Ex: `uusdc`. NOTE: Will get currency info from `originCurrency` on the IBC balance (from registrar).
   *  See: https://docs.axelar.dev/resources/mainnet#assets
   */
  tokenMinDenom: string;
}

/** See: https://docs.axelar.dev/resources/mainnet */
export type SourceChain =
  | "Ethereum"
  | "Avalanche"
  | "Fantom"
  | "Polygon"
  | "Moonbeam"
  | "cosmos" // IBC counterparty chains, would require IBC transfer to counterparty address
  | "emoney"
  | "juno"
  | "crescent"
  | "injective"
  | "terra"
  | "secret"
  | "kujira";

/** Maps axelar chain ids => cosmos chain ids */
export const SourceChainCosmosChainIdMap: { [sourceChain: string]: string } = {
  cosmos: "cosmoshub-4",
  emoney: "emoney-3",
  juno: "juno-1",
  injective: "injective-1",
  terra: "phoenix-1", // TERRA 2.0
  secret: "secret-4",
  kujira: "kaiyo-1",
};
