import { EncodeObject } from "@cosmjs/proto-signing";
import type { AssetList, Chain } from "@osmosis-labs/types";
import { RatePretty } from "@osmosis-labs/unit";
import type { CacheEntry } from "cachified";
import type { LRUCache } from "lru-cache";
import { Address, Hex } from "viem";
import { z } from "zod";

import { Bridge } from "./bridge-providers";

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
    revisionNumber?: string;
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
   * Return an empty array when no source assets are available for the given
   * input — that means "this provider has no route for this asset".
   * Providers backed by a remote registry (Skip, Squid) must instead THROW on
   * infrastructure failures (registry down, rate limited): a swallowed error
   * is indistinguishable from an unsupported asset, and the client relies on
   * a rejected query to retry and re-poll until the provider recovers.
   *
   * @param params The parameters for the supported assets request.
   * @param params.chain The chain the asset is on.
   * @param asset.asset The asset to derive sources from.
   * @returns A promise that resolves to an array of assets combined with each assets' chain info.
   */
  getSupportedAssets(
    params: GetBridgeSupportedAssetsParams
  ): Promise<(BridgeChain & BridgeSupportedAsset)[]>;

  /**
   * If the provider supports multi-transaction routes:
   * Rebuilds one intermediate-chain step of a previously quoted multi-tx
   * route for signing — with the wallet's real address on that chain as the
   * sender, a fresh timeout, and a fresh gas estimate. Throws a
   * `BridgeQuoteError` when the route no longer contains a transaction on
   * the requested chain (e.g. the provider's routing changed since quoting).
   *
   * @param params The original quote parameters plus the step to rebuild.
   * @returns A promise that resolves to the cosmos sign doc for that step.
   */
  getTransactionStep?: (
    params: GetBridgeTransactionStepParams
  ) => Promise<CosmosBridgeTransactionRequest>;

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

const tronChainSchema = z.object({
  /**
   * 728126428
   */
  chainId: z.number(),
  /**
   * Optional: The human-readable name of the chain.
   */
  chainName: z.string().optional(),

  chainType: z.literal("tron"),
});

const penumbraChainSchema = z.object({
  chainId: z.string(),
  chainName: z.string(),
  chainType: z.literal("penumbra"),
});

const dogecoinChainSchema = z.object({
  /**
   * `dogecoin`
   */
  chainId: z.string(),
  /**
   * Optional: The human-readable name of the chain.
   */
  chainName: z.string().optional(),

  chainType: z.literal("doge"),
});

const bitcoinCashChainSchema = z.object({
  /**
   * `bitcoin-cash`
   */
  chainId: z.string(),
  /**
   * Optional: The human-readable name of the chain.
   */
  chainName: z.string().optional(),

  chainType: z.literal("bitcoin-cash"),
});

const tonChainSchema = z.object({
  /**
   * `ton`
   */
  chainId: z.string(),
  /**
   * Optional: The human-readable name of the chain.
   */
  chainName: z.string().optional(),

  chainType: z.literal("ton"),
});

const litecoinChainSchema = z.object({
  /**
   * `litecoin`
   */
  chainId: z.string(),
  /**
   * Optional: The human-readable name of the chain.
   */
  chainName: z.string().optional(),

  chainType: z.literal("litecoin"),
});

const xrplChainSchema = z.object({
  /**
   * `xrpl`
   */
  chainId: z.string(),
  /**
   * Optional: The human-readable name of the chain.
   */
  chainName: z.string().optional(),

  chainType: z.literal("xrpl"),
});

export const bridgeChainSchema = z.discriminatedUnion("chainType", [
  cosmosChainSchema,
  evmChainSchema,
  solanaChainSchema,
  tonChainSchema,
  bitcoinChainSchema,
  bitcoinCashChainSchema,
  tronChainSchema,
  penumbraChainSchema,
  dogecoinChainSchema,
  litecoinChainSchema,
  xrplChainSchema,
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

/**
 * Specifies the types of transfers supported by the asset.
 * This helps the frontend determine which assets can be quoted,
 * used for deposit addresses, or have external URLs.
 */
export const bridgeSupportedAssetSchema = bridgeAssetSchema.extend({
  transferTypes: z.array(z.enum(["quote", "deposit-address", "external-url"])),
});

export type BridgeSupportedAsset = z.infer<typeof bridgeSupportedAssetSchema>;

export const getBridgeSupportedAssetsParams = z.object({
  /**
   * The originating chain information.
   */
  chain: bridgeChainSchema,
  /**
   * The asset on the originating chain.
   */
  asset: bridgeAssetSchema,
  /**
   * The direction of the transfer.
   */
  direction: z.enum(["deposit", "withdraw"]),
});

export type GetBridgeSupportedAssetsParams = z.infer<
  typeof getBridgeSupportedAssetsParams
>;

export interface BridgeDepositAddress {
  depositAddress: string;
  expirationTimeMs: number;
  minimumDeposit: BridgeCoin;
  networkFee: BridgeCoin;
  providerFee: RatePretty;
  estimatedTime: string;
}

export const getDepositAddressParamsSchema = z.object({
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
   * The address on the destination chain where the assets are to be received.
   */
  toAddress: z.string(),
});

export type GetDepositAddressParams = z.infer<
  typeof getDepositAddressParamsSchema
>;

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
  /**
   * Optional: Allow routes that require more than one user-signed transaction
   * (e.g. Skip's CCTP deposits that end in a swap on Osmosis, where the
   * Noble -> Osmosis leg must be signed separately). Multi-tx capable
   * providers return `transactionSteps` on the quote when the route needs it.
   */
  allowMultiTx: z.boolean().optional(),
});

export type GetBridgeQuoteParams = z.infer<typeof getBridgeQuoteSchema>;

export const getBridgeTransactionStepSchema = getBridgeQuoteSchema.extend({
  /**
   * The intermediate-chain step to (re)build for signing. `senderAddress`
   * must be the wallet's own account on that chain — an address derived by
   * bech32-converting another chain's address is NOT valid for chains with
   * different key types (e.g. Injective's ethsecp256k1).
   */
  step: z.object({
    chainId: z.string(),
    senderAddress: z.string(),
  }),
  /**
   * The quote's `multiTxRouteData`, passed back verbatim so the step is
   * rebuilt for the originally quoted route instead of a fresh one.
   */
  route: z.unknown(),
});

export type GetBridgeTransactionStepParams = z.infer<
  typeof getBridgeTransactionStepSchema
>;

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
  msgs: EncodeObject[];
  gasFee?: {
    gas: string;
    denom: string;
    amount: string;
  };
}

export type BridgeTransactionRequest =
  | EvmBridgeTransactionRequest
  | CosmosBridgeTransactionRequest;

/**
 * One user-signed transaction of a multi-transaction route, tagged with the
 * chain it must be signed on. `chainId` follows the `BridgeChain` shape:
 * number for EVM chains, string for cosmos chains.
 */
export type BridgeTransactionStep = BridgeTransactionRequest & {
  chainId: number | string;
};
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
    /**
     * Price impact of any swap bundled into the quote, as a stringified
     * fraction (e.g. "0.1" = 10%), NOT a percentage. Sign convention varies
     * by provider: Nomic bundles an Osmosis swap and reports negative
     * fractions, Squid reports positive (its API's percentage is divided by
     * 100 at the provider) — consumers must compare magnitudes, not raw
     * values. "0" when the quote involves no swap — except Skip, which
     * reports "0" even when its route swaps internally (known gap; the
     * fiat-loss check is its only defense).
     */
    priceImpact: string;
    /**
     * True when the quote bundles an Osmosis swap (e.g. alloy → variant
     * conversion) whose price impact could not be determined, so `priceImpact`
     * is a fallback "0" rather than a real figure. Consumers must treat the
     * loss as unknown rather than zero.
     */
    priceImpactUnknown?: boolean;
  };
  fromChain: Pick<BridgeChain, "chainId" | "chainName" | "chainType">;
  toChain: Pick<BridgeChain, "chainId" | "chainName" | "chainType">;
  /**
   * The fee for the transfer.
   */
  transferFee: BridgeCoin & {
    chainId: number | string;
    /** When true, the fee is charged on top of the input amount — the sent
     *  transaction requires `amount + fee` from the user's balance — rather
     *  than being deducted from the transferred amount in transit. */
    isAdditive?: boolean;
  };
  /**
   * The estimated time to execute the transfer, represented in seconds.
   */
  estimatedTime: number;
  /**
   * The estimated gas fee for the transfer.
   */
  estimatedGasFee?: BridgeCoin;

  /** Sign doc. For multi-tx routes this is the FIRST step's sign doc. */
  transactionRequest?: BridgeTransactionRequest;

  /**
   * Present only when the route requires more than one user-signed
   * transaction (`allowMultiTx` quotes). Ordered; the first step equals
   * `transactionRequest`. Later steps are quote-time drafts built with
   * derived addresses for estimation — before signing, each must be rebuilt
   * via the provider's `getTransactionStep` with the wallet's real address
   * on that chain.
   */
  transactionSteps?: BridgeTransactionStep[];

  /**
   * Provider-opaque snapshot of the quoted multi-tx route, passed back
   * verbatim to `getTransactionStep` so later steps are rebuilt for the
   * SAME route rather than re-routed (re-routing after the first tx has
   * moved funds could select different operations entirely). Persist it
   * alongside a mid-flow transfer so it survives a reload.
   */
  multiTxRouteData?: unknown;

  /**
   * Network fees of the later steps of a multi-tx route (e.g. the Noble
   * IBC transfer's fee in uusdc), so fee totals can include every step.
   * The first step's fee is `estimatedGasFee`.
   */
  intermediateGasFees?: BridgeCoin[];
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
    sendTxHash: string,
    status: TransferStatus,
    displayReason?: string
  ): void;
}

/** A simplified transfer status. */
export const transferStatusSchema = z.enum([
  "success",
  "pending",
  "failed",
  "refunded",
  "connection-error",
]);

/** A simplified reason for transfer failure. */
export const transferFailureReasonSchema = z.enum(["insufficientFee"]);
export type TransferFailureReason = z.infer<typeof transferFailureReasonSchema>;

export type TransferStatus = z.infer<typeof transferStatusSchema>;

const txSnapshotSchema = z.object({
  direction: z.enum(["deposit", "withdraw"]),
  createdAtUnix: z.number(),
  type: z.literal("bridge-transfer"),
  reason: transferFailureReasonSchema.optional(),
  provider: z.string().transform((val) => val as Bridge),
  fromAddress: z.string(),
  toAddress: z.string(),
  osmoBech32Address: z.string(),
  networkFee: bridgeAssetSchema
    .extend({
      amount: z.string(),
      imageUrl: z.string().optional(),
    })
    .optional(),
  providerFee: bridgeAssetSchema
    .extend({
      amount: z.string(),
      imageUrl: z.string().optional(),
    })
    .optional(),
  fromAsset: bridgeAssetSchema.extend({
    amount: z.string(),
    imageUrl: z.string().optional(),
  }),
  toAsset: bridgeAssetSchema.extend({
    amount: z.string().optional(),
    imageUrl: z.string().optional(),
  }),
  status: transferStatusSchema,
  sendTxHash: z.string(),
  fromChain: bridgeChainSchema.and(
    z.object({
      prettyName: z.string(),
    })
  ),
  toChain: bridgeChainSchema.and(
    z.object({
      prettyName: z.string(),
    })
  ),
  estimatedArrivalUnix: z.number(),
  nomicCheckpointIndex: z.number().optional(),
  /**
   * Chain to poll the status provider on when it differs from `fromChain` —
   * set when `sendTxHash` is a later step of a multi-tx route, signed on an
   * intermediate chain (e.g. noble-1) rather than the route's from chain.
   */
  trackingChainId: z.string().optional(),
  /**
   * Present while a multi-transaction route is mid-flow: the next
   * user-signed step, so an interrupted transfer can be resumed from
   * history. Cleared (set to undefined) when the final step is signed.
   * The rest of the snapshot (assets, chains, addresses, amount) carries
   * everything needed to rebuild the step via `getTransactionStep`.
   */
  pendingStep: z
    .object({
      /** Cosmos chain the user must sign the next step on (e.g. noble-1). */
      chainId: z.string(),
      prettyName: z.string(),
      /** 1-based index of the next step to sign. */
      stepIndex: z.number(),
      totalSteps: z.number(),
      /** Hash of the previously signed step's tx, whose arrival gates this step. */
      priorStepTxHash: z.string(),
      /** The quote's `multiTxRouteData`, for rebuilding this step on resume. */
      routeData: z.unknown().optional(),
      /**
       * The intermediate-chain account the first transaction routed funds
       * to (the account this step must be signed from). Resume compares
       * the connected wallet against it so a switched account can't sign
       * for funds it doesn't hold.
       */
      intermediateAddress: z.string().optional(),
      /**
       * The funds this step is expected to move (minimal denom units on
       * the intermediate chain). Resume checks the account still holds at
       * least this much before signing, so a transfer already completed
       * elsewhere (or moved funds) isn't signed again.
       */
      expectedArrival: z
        .object({
          denom: z.string(),
          amount: z.string(),
        })
        .optional(),
      /**
       * `expectedArrival.denom` balance the intermediate account held
       * BEFORE the first transaction (minimal denom units). Makes the
       * resume balance check replay-proof: the arrived funds must be
       * present on top of this, so an account that already held enough of
       * the denom can't pass the check after the step was completed from
       * another session.
       */
      preArrivalBalance: z.string().optional(),
    })
    .optional(),
});

export type TxSnapshot = z.infer<typeof txSnapshotSchema>;

/** Plugin to fetch status of many transactions from a remote source. */
export interface TransferStatusProvider {
  /** Example: axelar */
  readonly providerId: string;
  readonly sourceDisplayName?: string;
  /** Destination for updates to tracked transactions.  */
  statusReceiverDelegate?: TransferStatusReceiver;

  /**
   * Source instance should begin tracking a transaction identified by `key`.
   * @param key Example: Tx hash without prefix i.e. `0x...`
   */
  trackTxStatus(snapshot: TxSnapshot): void;

  /**
   * Make url to this tx explorer. Returns "" when no explorer link can be
   * resolved (e.g. the snapshot's from-chain is no longer in the registry),
   * so callers should treat an empty string as "no link available".
   */
  makeExplorerUrl(snapshot: TxSnapshot): string;
}
