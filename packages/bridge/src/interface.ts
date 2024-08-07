import type { AssetList, Chain } from "@osmosis-labs/types";
import type { CacheEntry } from "cachified";
import type { LRUCache } from "lru-cache";
import { Address, Hex } from "viem";
import { z } from "zod";

export type BridgeEnvironment = "mainnet" | "testnet";

export interface BridgeProviderContext {
  env: BridgeEnvironment;
  cache: LRUCache<string, CacheEntry>;
  assetLists: AssetList[];
  chainList: Chain[];

  /** Provides current timeout height for a chain of given chainId.
   *  If a destination address is provided, the bech32Prefix will be used to get the chain. */
  getTimeoutHeight(params: {
    chainId?: string;
    destinationAddress?: string;
  }): Promise<{
    revisionNumber: string | undefined;
    revisionHeight: string;
  }>;
}

export interface BridgeProvider {
  readonly providerName: string;

  /**
   * Requests a quote for a cross-chain transfer.
   *
   * @param params The parameters for the quote request.
   * @returns A promise that resolves to a GetBridgeQuoteResponse object.
   */
  getQuote(params: GetBridgeQuoteParams): Promise<BridgeQuote>;

  /**
   * Requests one or more transactions to initiate a cross-chain transfer.
   *
   * @param params The parameters from a prior quote request.
   * @returns A promise that resolves to a sign document ready to be signed.
   */
  getTransactionData: (
    params: GetBridgeQuoteParams
  ) => Promise<BridgeTransactionRequest>;

  /**
   * Requests the available source assets for a given chain and coin.
   * Restricted to assets that don't change the user's underlying asset exposure, in other words, is the same variant of the asset.
   * In practice, this can be used to offer a list of selectable assets for the user to choose from.
   *
   * In general should avoid throwing errors, but return an empty array if no source assets are available with the given input.
   * If an unexpected error occurs, perhaps if the provider is down, then no assets will be returned to prevent the user from selecting an asset that cannot be transferred.
   *
   * @param params The parameters for the supported assets request.
   * @param params.chain The chain the asset is on.
   * @param asset.asset The asset to derive sources from.
   * @returns A promise that resolves to an array of assets combined with each assets' chain info.
   */
  getSupportedAssets(
    params: GetBridgeSupportedAssetsParams
  ): Promise<(BridgeChain & BridgeAsset)[]>;

  /**
   * If the provider supports deposit address transfers:
   * Requests for a deposit address generated from the given params.
   * Sending to the deposit address automatically triggers the transfer.
   *
   * @param params The parameters from a prior quote request.
   * @returns A promise that resolves to a deposit address ready for signing.
   */
  getDepositAddress?: (
    params: GetDepositAddressParams
  ) => Promise<BridgeDepositAddress>;

  /**
   * Retrieves an external bridge URL for the given assets.
   *
   * This method generates a URL that can be used to perform a cross-chain transfer
   * using an external bridge service. The URL is constructed based on the provided
   * parameters, which include details about the source and destination chains, as well
   * as the assets involved in the transfer.
   *
   * @param params - The parameters required to generate the external bridge URL.
   * @param params.fromChain - The source chain from which the asset is being transferred.
   * @param params.toChain - The destination chain to which the asset is being transferred.
   * @param params.fromAsset - The asset being transferred from the source chain.
   * @param params.toAsset - The asset being received on the destination chain.
   * @param params.toAddress - The address on the destination chain to which the asset is being sent.
   *
   * @returns A promise that resolves to a BridgeExternalUrl object containing the URL and the provider name,
   *          or undefined if the URL could not be generated.
   */
  getExternalUrl(
    params: GetBridgeExternalUrlParams
  ): Promise<BridgeExternalUrl | undefined>;
}

const cosmosChainSchema = z.object({
  /**
   * Cosmos chainId
   *
   * Examples:
   * - osmosis-1
   * - cosmoshub-4
   */
  chainId: z.string(),
  /**
   * Optional: The human-readable name of the chain.
   */
  chainName: z.string().optional(),
  /**
   * Optional: The name of the network to which the chain belongs.
   */
  networkName: z.string().optional(),
  /**
   * The type of blockchain, which is 'cosmos' for Cosmos-based chains.
   */
  chainType: z.literal("cosmos"),
});

const evmChainSchema = z.object({
  /**
   * EVM chainId
   *
   * Examples:
   * - 1 (Ethereum)
   * - 10 (Optimism)
   */
  chainId: z.number(),
  /**
   * Optional: The human-readable name of the chain.
   */
  chainName: z.string().optional(),
  /**
   * Optional: The name of the network to which the chain belongs.
   */
  networkName: z.string().optional(),
  /**
   * The type of blockchain, which is 'evm' for EVM-based chains.
   */
  chainType: z.literal("evm"),
});

const solanaChainSchema = z.object({
  /**
   * `solana`
   */
  chainId: z.string(),
  /**
   * Optional: The human-readable name of the chain.
   */
  chainName: z.string().optional(),

  chainType: z.literal("solana"),
});

const bitcoinChainSchema = z.object({
  /**
   * `bitcoin`
   */
  chainId: z.string(),
  /**
   * Optional: The human-readable name of the chain.
   */
  chainName: z.string().optional(),

  chainType: z.literal("bitcoin"),
});

export const bridgeChainSchema = z.discriminatedUnion("chainType", [
  cosmosChainSchema,
  evmChainSchema,
  solanaChainSchema,
  bitcoinChainSchema,
]);

export type BridgeChain = z.infer<typeof bridgeChainSchema>;

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

export const bridgeAssetSchema = z.object({
  /**
   * The displayable denomination of the asset.
   */
  denom: z.string(),
  /**
   * The address of the asset, represented as an IBC denom, origin denom, or EVM contract address.
   */
  address: z.string(),
  /**
   * The number of decimal places for the asset.
   */
  decimals: z.number(),

  /** CoinGecko ID for getting prices. */
  coinGeckoId: z.string().optional(),
});

export type BridgeAsset = z.infer<typeof bridgeAssetSchema>;

export const getBridgeSupportedAssetsParams = z.object({
  /**
   * The originating chain information.
   */
  chain: bridgeChainSchema,
  /**
   * The asset on the originating chain.
   */
  asset: bridgeAssetSchema,
});

export type GetBridgeSupportedAssetsParams = z.infer<
  typeof getBridgeSupportedAssetsParams
>;

export interface BridgeDepositAddress {
  depositAddress: string;
}

export interface GetDepositAddressParams {
  /**
   * The originating chain information.
   */
  fromChain: BridgeChain;
  /**
   * The destination chain information.
   */
  toChain: BridgeChain;
  /**
   * The asset on the originating chain.
   */
  fromAsset: BridgeAsset;
  /**
   * The asset on the destination chain.
   */
  toAsset: BridgeAsset;
  /**
   * The address on the destination chain where the assets are to be received.
   */
  toAddress: string;
}

export const getBridgeExternalUrlSchema = z.object({
  /**
   * The originating chain information.
   */
  fromChain: bridgeChainSchema.optional(),
  /**
   * The destination chain information.
   */
  toChain: bridgeChainSchema.optional(),
  /**
   * The asset on the originating chain.
   */
  fromAsset: bridgeAssetSchema.optional(),
  /**
   * The asset on the destination chain.
   */
  toAsset: bridgeAssetSchema.optional(),
  /**
   * The address on the destination chain where the assets are to be received.
   */
  toAddress: z.string().optional(),
});

export type GetBridgeExternalUrlParams = z.infer<
  typeof getBridgeExternalUrlSchema
>;

export const getBridgeQuoteSchema = z.object({
  /**
   * The originating chain information.
   */
  fromChain: bridgeChainSchema,
  /**
   * The destination chain information.
   */
  toChain: bridgeChainSchema,
  /**
   * The asset on the originating chain.
   */
  fromAsset: bridgeAssetSchema,
  /**
   * The asset on the destination chain.
   */
  toAsset: bridgeAssetSchema,
  /**
   * The amount to be transferred from the originating chain, represented as a string integer.
   */
  fromAmount: z.string(),
  /**
   * The address on the originating chain from where the assets are transferred.
   */
  fromAddress: z.string(),
  /**
   * The address on the destination chain where the assets are to be received.
   */
  toAddress: z.string(),
  /**
   * Optional: The tolerance for price slippage, represented as a percentage. Valid values are > 0 and < 99.99.
   */
  slippage: z.number().optional(),
});

export type GetBridgeQuoteParams = z.infer<typeof getBridgeQuoteSchema>;

export interface EvmBridgeTransactionRequest {
  type: "evm";
  to: Address;
  data?: Hex;
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
  gasFee?: {
    gas: string;
    denom: string;
    amount: string;
  };
}

interface QRCodeBridgeTransactionRequest {
  type: "qrcode";
}

export type BridgeTransactionRequest =
  | EvmBridgeTransactionRequest
  | CosmosBridgeTransactionRequest
  | QRCodeBridgeTransactionRequest;

/**
 * Bridge asset with raw base amount (without decimals).
 */
export type BridgeCoin = {
  amount: string;
  denom: string;
  /** The address of the asset, represented as an IBC denom, origin denom, or EVM contract address. */
  address: string;
  decimals: number;
  coinGeckoId?: string;
};

export interface BridgeQuote {
  input: BridgeCoin;
  expectedOutput: BridgeCoin & {
    /** Percentage represented as string. E.g. 10.0, 95.0 */
    priceImpact: string;
  };
  fromChain: Pick<BridgeChain, "chainId" | "chainName" | "chainType">;
  toChain: Pick<BridgeChain, "chainId" | "chainName" | "chainType">;
  /**
   * The fee for the transfer.
   */
  transferFee: BridgeCoin & { chainId: number | string };
  /**
   * The estimated time to execute the transfer, represented in seconds.
   */
  estimatedTime: number;
  /**
   * The estimated gas fee for the transfer.
   */
  estimatedGasFee?: BridgeCoin;

  /** Sign doc. */
  transactionRequest?: BridgeTransactionRequest;
}

export interface BridgeExternalUrl {
  urlProviderName: string;
  url: URL;
}

// Transfer status

export interface GetTransferStatusParams {
  sendTxHash: string;
  fromChainId: BridgeChain["chainId"];
  toChainId: BridgeChain["chainId"];
}

export interface BridgeTransferStatus {
  id: string;
  status: TransferStatus;
  reason?: TransferFailureReason;
}

/** Capable of receiving updates as a delegate passed to a `TransferStatusProvider`. */
export interface TransferStatusReceiver {
  /** Key with prefix (`keyPrefix`) included. */
  receiveNewTxStatus(
    prefixedKey: string,
    status: TransferStatus,
    displayReason?: string
  ): void;
}

/** A simplified transfer status. */
export type TransferStatus =
  | "success"
  | "pending"
  | "failed"
  | "refunded"
  | "connection-error";

/** A simplified reason for transfer failure. */
export type TransferFailureReason = "insufficientFee";

/** Plugin to fetch status of many transactions from a remote source. */
export interface TransferStatusProvider {
  /** Example: axelar */
  readonly keyPrefix: string;
  readonly sourceDisplayName?: string;
  /** Destination for updates to tracked transactions.  */
  statusReceiverDelegate?: TransferStatusReceiver;

  /**
   * Source instance should begin tracking a transaction identified by `key`.
   * @param key Example: Tx hash without prefix i.e. `0x...`
   */
  trackTxStatus(key: string): void;

  /** Make url to this tx explorer. */
  makeExplorerUrl(key: string): string;
}
