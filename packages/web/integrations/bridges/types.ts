import type { CacheEntry } from "cachified";
import type { LRUCache } from "lru-cache";

export interface BridgeProvider {
  providerName: string;
  logoUrl: string;
  /**
   * Requests a quote for a cross-chain transfer.
   *
   * @param params The parameters for the quote request.
   * @returns A promise that resolves to a GetBridgeQuoteResponse object.
   */
  getQuote(params: GetBridgeQuoteParams): Promise<BridgeQuote>;
  getTransferStatus(
    params: GetTransferStatusParams
  ): Promise<BridgeTransferStatus | undefined>;
  getTransactionData: (
    params: GetBridgeQuoteParams
  ) => Promise<BridgeTransactionRequest>;
  getDepositAddress?: (
    params: GetDepositAddressParams
  ) => Promise<BridgeDepositAddress>;
}

export interface BridgeProviderContext {
  env: "mainnet" | "testnet";
  cache: LRUCache<string, CacheEntry>;
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
   * The type of blockchain, either 'evm' for EVM-based chains or 'cosmos' for Cosmos-based chains.
   */
  chainType: "evm" | "cosmos";
}

export interface BridgeTransferStatus {
  id: string;
  status: "success" | "failed";
  reason?: string;
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
  /**
   * The number of decimal places for the asset.
   */
  decimals: number;
  minimalDenom: string;
}

export interface BridgeDepositAddress {
  depositAddress: string;
}

export interface GetDepositAddressParams {
  /**
   * The originating chain information.
   */
  fromChain: Pick<BridgeChain, "chainId" | "chainName" | "chainType">;
  /**
   * The destination chain information.
   */
  toChain: Pick<BridgeChain, "chainId" | "chainName" | "chainType">;
  /**
   * The asset on the originating chain.
   */
  fromAsset: BridgeAsset;
  /**
   * The address on the destination chain where the assets are to be received.
   */
  toAddress: string;
  autoUnwrapIntoNative?: boolean;
}

export interface GetTransferStatusParams {
  sendTxHash: string;
}

export interface GetBridgeQuoteParams {
  /**
   * The originating chain information.
   */
  fromChain: Pick<BridgeChain, "chainId" | "chainName" | "chainType">;
  /**
   * The destination chain information.
   */
  toChain: Pick<BridgeChain, "chainId" | "chainName" | "chainType">;
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
  fiatValue?: {
    currency: "usd";
    amount: string;
  };
}

export interface EvmBridgeTransactionRequest {
  type: "evm";
  to: string;
  data: string;
  value?: string;
  gasPrice?: string;
  maxPriorityFeePerGas?: string;
  maxFeePerGas?: string;
  /** Also known as gas limit */
  gas?: string;
  /** Approval transaction for tokens when needed */
  approvalTransactionRequest?: {
    to: string;
    data: string;
  };
}

export interface CosmosBridgeTransactionRequest {
  type: "cosmos";
  msgTypeUrl: string;
  msg: Record<string, any>;
}

interface QRCodeBridgeTransactionRequest {
  type: "qrcode";
}

export type BridgeTransactionRequest =
  | EvmBridgeTransactionRequest
  | CosmosBridgeTransactionRequest
  | QRCodeBridgeTransactionRequest;

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
  transactionRequest?: BridgeTransactionRequest;
}
