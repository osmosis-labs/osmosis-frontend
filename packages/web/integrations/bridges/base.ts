export interface BridgeProvider {
  providerName: string;
  /**
   * Requests a quote for a cross-chain transfer.
   *
   * @param params The parameters for the quote request.
   * @returns A promise that resolves to a GetBridgeQuoteResponse object.
   */
  getQuote(params: GetBridgeQuoteParams): Promise<BridgeQuote>;
  /**
   * Executes a transfer route based on the provided parameters.
   *
   * @param params The parameters for executing the transfer.
   * @returns A promise that resolves to any value.
   */
  executeRoute(params: ExecuteRouteParams): Promise<any>;
  /**
   * Retrieves the operational status of the bridge.
   *
   * @returns A promise that resolves to a BridgeStatus object.
   */
  getStatus(): Promise<BridgeStatus>;
  /**
   * Lists the available assets on the bridge.
   *
   * @returns A promise that resolves to an array of BridgeAsset objects.
   */
  getAssets(): Promise<BridgeAsset[]>;
  /**
   * Lists the supported chains on the bridge.
   *
   * @returns A promise that resolves to an array of BridgeChain objects.
   */
  getChains(): Promise<BridgeChain[]>;
}

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
  /**
   * Optional: The human-readable name of the chain.
   */
  chainName?: string;
  /**
   * Optional: The name of the network to which the chain belongs.
   */
  networkName?: string;
  /**
   * Optional: The type of blockchain, either 'evm' for EVM-based chains or 'cosmos' for Cosmos-based chains.
   */
  chainType?: "evm" | "cosmos";
}

export interface BridgeStatus {
  /**
   * Indicates whether the bridge is currently in maintenance mode.
   */
  isInMaintenanceMode: boolean;
  /**
   * Optional: A message providing more information about the maintenance status.
   */
  maintenanceMessage?: string;
}

export interface BridgeAsset {
  /**
   * The denomination of the asset.
   */
  denom: string;
  /**
   * The address of the asset, represented as an IBC denom or EVM contract address.
   */
  address: string;
}

export interface GetBridgeQuoteParams {
  /**
   * The originating chain information.
   */
  fromChain: Pick<BridgeChain, "chainId" | "chainName">;
  /**
   * The destination chain information.
   */
  toChain: Pick<BridgeChain, "chainId" | "chainName">;
  /**
   * The asset on the originating chain.
   */
  fromAsset: BridgeAsset;

  /**
   * The asset on the destination chain.
   */
  toAsset: BridgeAsset;
  /**
   * The amount to be transferred from the originating chain, represented as a string.
   */
  fromAmount: string;
  /**
   * The address on the originating chain from where the assets are transferred.
   */
  fromAddress: string;
  /**
   * The address on the destination chain where the assets are to be received.
   */
  toAddress: string;
  /**
   * Optional: The tolerance for price slippage, represented as a percentage. Valid values are > 0 and < 99.99.
   */
  slippage?: number;
}

interface BridgeCoin {
  amount: string;
  denom: string;
  coinMinimalDenom: string;
  decimals: number;
}

export interface BridgeQuote {
  fromAmount: string;
  toAmount: string;
  toAmountMin: string;
  /**
   * The fee for the transfer.
   */
  transferFee: BridgeCoin;
  /**
   * The estimated time to execute the transfer, represented in seconds.
   */
  estimatedTime: number;
  /**
   * The estimated gas fee for the transfer.
   */
  estimatedGasFee?: BridgeCoin;
  transactionRequest: {
    routeType: string;
    targetAddress: string;
    data: string;
    value: string;
    gasLimit?: string;
    gasPrice?: string;
    maxFeePerGas?: string;
    maxPriorityFeePerGas?: string;
  };
}

export class BridgeQuoteError extends Error {
  errors: Array<{
    errorType: string;
    message: string;
  }>;

  constructor(
    errors: Array<{
      errorType: string;
      message: string;
    }>
  ) {
    super();
    this.errors = errors;
    this.name = "BridgeQuoteError";
  }
}

type ExecuteRouteParams = GetBridgeQuoteParams;
