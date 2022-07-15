export interface AxelarBridgeConfig {
  /** Currently just via deposit address, future could be gateway contract call. */
  method: "deposit-address";
  /** Chains that can fungibly source this asset.
   *
   *  See this FigJam for axlUSDC case:
   *  https://www.figma.com/file/utRjpBIvD7sRm31vxif7hF/Bridge-Integration-Diagram?node-id=340%3A935
   */
  sourceChains: SourceChain[];
  /** Ex: `uusdc`.
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
