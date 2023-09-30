export interface BridgeChain {
  /**
   * EVM chainId or Cosmos chainId
   *
   * Cosmos examples:
   * - osmosis-1
   * - cosmoshub-4
   *
   * EVM Examples:
   * - 1 (Ethereum)
   * - 10 (Optimism)
   */
  chainId: number | string;
  chainName?: string;
  networkName?: string;
  chainType?: "evm" | "cosmos";
}

export interface BridgeStatus {
  isInMaintenanceMode: boolean;
  maintenanceMessage?: string;
}

export interface BridgeAsset {
  denom: string;
  /** IBC denom or EVM contract address */
  address: string;
}

export interface GetBridgeQuoteParams {
  fromChain: Pick<BridgeChain, "chainId" | "chainName">;
  toChain: Pick<BridgeChain, "chainId" | "chainName">;
  fromAsset: BridgeAsset;
  toAsset: BridgeAsset;
  /** Numeric value - Amount to be sent from To Chain */
  fromAmount: string;
  /** From address. E.g. EVM address for EVM to Cosmos, and Cosmos address for Cosmos to EVM. */
  fromAddress: string;
  /** To Chain recipient address */
  toAddress: string;
  /** slippage in percentage, allowed value > 0 and < 99.99 */
  slippage?: number;
}

type ExecuteRouteParams = GetBridgeQuoteParams;

export interface BridgeProvider {
  getQuote(params: GetBridgeQuoteParams): Promise<any>;
  executeRoute(params: ExecuteRouteParams): Promise<any>;
  getStatus(): Promise<BridgeStatus>;
  getAssets(): Promise<BridgeAsset[]>;
  getChains(): Promise<BridgeChain[]>;
}
