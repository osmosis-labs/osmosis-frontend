import type { Registry } from "@cosmjs/proto-signing";
import {
  estimateGasFee,
  getDefaultGasPrice,
  makeExecuteCosmwasmContractMsg,
  makeIBCTransferMsg,
  simulateCosmosTxBody,
} from "@osmosis-labs/tx";
import { CosmosCounterparty, EVMCounterparty } from "@osmosis-labs/types";
import { Dec } from "@osmosis-labs/unit";
import {
  apiClient,
  EthereumChainInfo,
  getEvmRpcTransport,
  isNil,
  NativeEVMTokenConstantAddress,
} from "@osmosis-labs/utils";
import cachified from "cachified";
import {
  Address,
  createPublicClient,
  encodeFunctionData,
  encodePacked,
  erc20Abi,
  keccak256,
  maxUint256,
  numberToHex,
} from "viem";

import {
  BridgeFeeExceedsBudgetMessage,
  BridgeQuoteError,
  BridgeRouteExpiredMessage,
} from "../errors";
import {
  BridgeAsset,
  BridgeChain,
  BridgeExternalUrl,
  BridgeProvider,
  BridgeProviderContext,
  BridgeQuote,
  BridgeSupportedAsset,
  BridgeTransactionRequest,
  BridgeTransactionStep,
  CosmosBridgeTransactionRequest,
  EvmBridgeTransactionRequest,
  GetBridgeExternalUrlParams,
  GetBridgeQuoteParams,
  GetBridgeSupportedAssetsParams,
  GetBridgeTransactionStepParams,
} from "../interface";
import { BridgeAssetMap } from "../utils/asset";
import { SkipApiClient } from "./client";
import {
  SkipEstimatedFee,
  SkipEvmTx,
  SkipMsg,
  SkipMultiChainMsg,
  SkipMultiTxRouteData,
  SkipRouteResponse,
} from "./types";

export class SkipBridgeProvider implements BridgeProvider {
  static readonly ID = "Skip";
  readonly providerName = SkipBridgeProvider.ID;

  readonly skipClient: SkipApiClient;
  protected protoRegistry: Registry | null = null;

  constructor(protected readonly ctx: BridgeProviderContext) {
    this.skipClient = new SkipApiClient(ctx.env);
  }

  async getQuote(params: GetBridgeQuoteParams): Promise<BridgeQuote> {
    const {
      fromAmount,
      fromAsset,
      fromChain,
      toAsset,
      toChain,
      fromAddress,
      toAddress,
      slippage,
      allowMultiTx,
    } = params;

    return cachified({
      cache: this.ctx.cache,
      key: JSON.stringify({
        id: SkipBridgeProvider.ID,
        fromAmount,
        fromAsset,
        fromChain,
        fromAddress,
        toAddress,
        toAsset,
        toChain,
        slippage,
        allowMultiTx,
      }),
      ttl: process.env.NODE_ENV === "test" ? -1 : 20 * 1000, // 20 seconds
      getFreshValue: async (): Promise<BridgeQuote> => {
        const sourceAsset = await this.getAsset(fromChain, fromAsset);

        if (!sourceAsset) {
          throw new BridgeQuoteError({
            bridgeId: SkipBridgeProvider.ID,
            errorType: "UnsupportedQuoteError",
            message: `Unsupported asset ${fromAsset.denom} on ${fromChain.chainName}`,
          });
        }

        const destinationAsset = await this.getAsset(toChain, toAsset);

        if (!destinationAsset) {
          throw new BridgeQuoteError({
            bridgeId: SkipBridgeProvider.ID,
            errorType: "UnsupportedQuoteError",
            message: `Unsupported asset ${toAsset.denom} on ${toChain.chainName}`,
          });
        }

        const fetchRoute = (allowMulti: boolean) =>
          this.skipClient
            .route({
              source_asset_denom: sourceAsset.denom,
              source_asset_chain_id: fromChain.chainId.toString(),
              dest_asset_denom: destinationAsset.denom,
              dest_asset_chain_id: toChain.chainId.toString(),
              amount_in: fromAmount,
              // Omit the key entirely when off so the request matches the
              // pre-multi-tx shape byte for byte.
              ...(allowMulti ? { allow_multi_tx: true } : {}),
            })
            .catch((e) => {
              if (e instanceof Error) {
                const msg = e.message;
                if (
                  msg.includes(
                    "Input amount is too low to cover"
                    // Could be Axelar or CCTP
                  ) ||
                  msg.includes(
                    "Difference in USD value of route input and output is too large"
                  )
                ) {
                  throw new BridgeQuoteError({
                    bridgeId: SkipBridgeProvider.ID,
                    errorType: "InsufficientAmountError",
                    message: msg,
                  });
                }
                if (
                  msg.includes(
                    "cannot transfer across cctp after route demands swap"
                  )
                ) {
                  throw new BridgeQuoteError({
                    bridgeId: SkipBridgeProvider.ID,
                    errorType: "NoQuotesError",
                    message: msg,
                  });
                }
                if (
                  msg.includes(
                    "no single-tx routes found, to enable multi-tx routes set allow_multi_tx to true"
                  ) ||
                  msg.includes("no routes found")
                ) {
                  throw new BridgeQuoteError({
                    bridgeId: SkipBridgeProvider.ID,
                    errorType: "NoQuotesError",
                    message: msg,
                  });
                }
              }
              throw e;
            });

        // Single-tx routes are preferred for UX (one signature), but not at
        // any price: a lossy single-tx path (observed live: Avalanche USDC
        // via axelar + swap paying ~21% less than the multi-tx CCTP route)
        // must not win against a multi-tx route that pays meaningfully
        // more. When multi-tx is allowed, both routes are quoted in
        // parallel and the single-tx route is kept unless the multi-tx
        // route's output beats it by more than this threshold.
        const MULTI_TX_MIN_IMPROVEMENT_BPS = BigInt(50); // 0.5%

        let route: Awaited<ReturnType<typeof fetchRoute>>;
        if (!allowMultiTx) {
          route = await fetchRoute(false);
        } else {
          const [singleResult, multiResult] = await Promise.allSettled([
            fetchRoute(false),
            fetchRoute(true),
          ]);
          const single =
            singleResult.status === "fulfilled"
              ? singleResult.value
              : undefined;
          const multi =
            multiResult.status === "fulfilled" ? multiResult.value : undefined;

          if (single && multi) {
            const singleOut = BigInt(single.amount_out);
            const multiOut = BigInt(multi.amount_out);
            // allow_multi_tx is permission, not preference: the
            // multi-permitted route can itself be single-tx, in which case
            // the better output simply wins with no threshold.
            route =
              multi.txs_required <= 1
                ? multiOut > singleOut
                  ? multi
                  : single
                : multiOut * BigInt(10_000) >
                  singleOut * (BigInt(10_000) + MULTI_TX_MIN_IMPROVEMENT_BPS)
                ? multi
                : single;
          } else if (single || multi) {
            route = (single ?? multi)!;
          } else {
            // Both failed. The single-tx "no single-tx routes found"
            // refusal is less informative than whatever stopped the
            // multi-tx attempt, so prefer the multi-tx error in that case.
            const singleReason = (singleResult as PromiseRejectedResult).reason;
            throw singleReason instanceof BridgeQuoteError &&
              singleReason.message.includes("no single-tx routes found")
              ? (multiResult as PromiseRejectedResult).reason
              : singleReason;
          }
        }

        const addressList = await this.getAddressList(
          // required_chain_addresses is the authoritative list for /msgs: it
          // can repeat a chain (multi-tx routes), so chain_ids would misalign.
          route.required_chain_addresses ?? route.chain_ids,
          fromAddress,
          toAddress,
          fromChain,
          toChain
        );

        let transferFee: BridgeQuote["transferFee"] = {
          ...fromAsset,
          coinGeckoId: sourceAsset.coingecko_id,
          amount: "0",
          chainId: fromChain.chainId,
        };

        // Per Skip's fee docs, EVM-source bridge fees are charged on top of
        // amount_in (the built tx's value is amount + fee) while Cosmos-source
        // fees are deducted in transit. Prefer the API's explicit fee_behavior
        // on the BRIDGE fee entries (the ones transferFee represents — other
        // fee types like SMART_RELAY say nothing about the bridge fee);
        // otherwise assume additive for EVM sources so max-amount inputs
        // reserve the fee (over-reserving strands fee-sized dust,
        // under-reserving fails the wallet signature).
        // Unknown/unspecified behaviors fall through to the EVM default so
        // they fail toward over-reserving; only an explicit DEDUCTED opts out.
        const isAdditive = (fees: SkipEstimatedFee[]) => {
          const behaviors = fees.map((fee) => fee.fee_behavior);
          return (
            behaviors.includes("FEE_BEHAVIOR_ADDITIONAL") ||
            (!behaviors.includes("FEE_BEHAVIOR_DEDUCTED") &&
              fromChain.chainType === "evm")
          );
        };
        const isAdditiveFee = isAdditive(
          route.estimated_fees?.filter((fee) => fee.fee_type === "BRIDGE") ?? []
        );

        for (const operation of route.operations) {
          if ("axelar_transfer" in operation) {
            const feeAsset = operation.axelar_transfer.fee_asset;

            transferFee = {
              amount: operation.axelar_transfer.fee_amount,
              denom: feeAsset.symbol ?? feeAsset.denom,
              chainId: feeAsset.is_evm
                ? Number(feeAsset.chain_id)
                : feeAsset.chain_id,
              address:
                feeAsset.is_evm && !Boolean(feeAsset.token_contract)
                  ? NativeEVMTokenConstantAddress
                  : feeAsset.token_contract!,
              decimals: feeAsset.decimals ?? 6,
              coinGeckoId: feeAsset.coingecko_id,
              isAdditive: isAdditiveFee,
            };
          }
        }

        // Routes without an Axelar leg (e.g. CCTP) pay Skip's relayer
        // instead, and that fee only appears as a SMART_RELAY estimate.
        // Only fees in the source asset fit the single-coin transferFee.
        if (!route.operations.some((op) => "axelar_transfer" in op)) {
          const relayFees =
            route.estimated_fees?.filter(
              (fee) =>
                fee.fee_type === "SMART_RELAY" &&
                fee.amount &&
                fee.chain_id === route.source_asset_chain_id &&
                fee.origin_asset?.denom.toLowerCase() ===
                  route.source_asset_denom.toLowerCase()
            ) ?? [];

          if (relayFees.length > 0) {
            transferFee = {
              ...transferFee,
              amount: relayFees
                .reduce((sum, fee) => sum + BigInt(fee.amount), BigInt(0))
                .toString(),
              isAdditive: isAdditive(relayFees),
            };
          }
        }

        const { msgs } = await this.skipClient.messages({
          address_list: addressList,
          source_asset_denom: route.source_asset_denom,
          source_asset_chain_id: route.source_asset_chain_id,
          dest_asset_denom: route.dest_asset_denom,
          dest_asset_chain_id: route.dest_asset_chain_id,
          amount_in: route.amount_in,
          amount_out: route.amount_out,
          operations: route.operations,
        });

        const isMultiTx = route.txs_required > 1 || msgs.length > 1;

        let transactionRequest:
          | (BridgeTransactionRequest & { fallbackGasLimit?: number })
          | undefined;
        let transactionSteps: BridgeTransactionStep[] | undefined;
        let multiTxRouteData: SkipMultiTxRouteData | undefined;
        let intermediateGasFees: BridgeQuote["intermediateGasFees"];
        if (isMultiTx) {
          // Quote-time messages derive intermediate-chain addresses by
          // bech32-converting the destination address. That's only the
          // user's own account on chains with standard 118 key derivation —
          // on e.g. Injective (ethsecp256k1, coin type 60) the converted
          // address is one the user does NOT control, and the first tx
          // would route funds through it. Refuse rather than build one.
          // Gated on isMultiTx (not just txs_required) so a route that
          // reports one tx but returns multiple messages is checked too.
          this.assertControlledIntermediates(route, fromChain, toChain);

          transactionSteps = await this.createTransactionSteps(
            fromAddress as Address,
            msgs,
            route.operations
          );
          // The first step is signed first on the from chain; expose it as
          // the plain transactionRequest so gas estimation and single-tx
          // consumers keep working unchanged.
          transactionRequest = transactionSteps[0];
          // Snapshot the quoted route so later steps are rebuilt for THIS
          // route (getTransactionStep), never re-routed mid-transfer.
          multiTxRouteData = {
            source_asset_denom: route.source_asset_denom,
            source_asset_chain_id: route.source_asset_chain_id,
            dest_asset_denom: route.dest_asset_denom,
            dest_asset_chain_id: route.dest_asset_chain_id,
            amount_in: route.amount_in,
            amount_out: route.amount_out,
            operations: route.operations,
            required_chain_addresses:
              route.required_chain_addresses ?? route.chain_ids,
          };
          intermediateGasFees = await this.getIntermediateGasFees(
            transactionSteps.slice(1)
          );
        } else {
          transactionRequest = await this.createTransaction(
            fromChain.chainId.toString(),
            fromAddress as Address,
            msgs
          );
        }

        if (!transactionRequest) {
          throw new Error("Failed to create transaction");
        }

        const estimatedGasFee = await this.estimateGasFee(
          params,
          transactionRequest
        );

        return {
          input: {
            coinGeckoId: sourceAsset.coingecko_id,
            ...fromAsset,
            amount: fromAmount,
          },
          expectedOutput: {
            amount: route.amount_out,
            coinGeckoId: destinationAsset.coingecko_id,
            ...toAsset,
            priceImpact: "0",
          },
          fromChain,
          toChain,
          transferFee,
          estimatedTime: route.estimated_route_duration_seconds,
          transactionRequest:
            transactionRequest.type === "cosmos" && estimatedGasFee?.gas
              ? {
                  ...transactionRequest,
                  gasFee: {
                    gas: estimatedGasFee.gas,
                    denom: estimatedGasFee.address,
                    amount: estimatedGasFee.amount,
                  },
                }
              : transactionRequest,
          transactionSteps,
          multiTxRouteData,
          intermediateGasFees,
          estimatedGasFee,
        };
      },
    });
  }

  /**
   * Rejects multi-tx routes whose intermediate chains cannot safely receive
   * funds at a bech32-converted address. Quote-time messages derive
   * intermediate addresses from the destination address, which is only the
   * user's own account on chains with standard secp256k1 / coin type 118
   * derivation (e.g. Noble). On Injective (ethsecp256k1, coin type 60) the
   * converted address belongs to no one the user controls, and the FIRST
   * transaction would already route funds through it.
   */
  protected assertControlledIntermediates(
    route: SkipRouteResponse,
    fromChain: BridgeChain,
    toChain: BridgeChain
  ) {
    const intermediateChainIds = new Set(
      (route.required_chain_addresses ?? route.chain_ids).filter(
        (chainId) =>
          chainId !== String(fromChain.chainId) &&
          chainId !== String(toChain.chainId)
      )
    );

    for (const chainId of intermediateChainIds) {
      const chain = this.ctx.chainList.find((c) => c.chain_id === chainId);
      if (!chain || chain.slip44 !== 118) {
        throw new BridgeQuoteError({
          bridgeId: SkipBridgeProvider.ID,
          errorType: "NoQuotesError",
          message: `Multi-tx route requires an account on ${chainId}, whose key derivation differs from the destination address; refusing to derive an address the user may not control`,
        });
      }
    }
  }

  /**
   * Network fees of the later steps of a multi-tx route as displayable
   * coins, resolved against Skip's asset registry for decimals/symbol.
   */
  async getIntermediateGasFees(
    laterSteps: BridgeTransactionStep[]
  ): Promise<NonNullable<BridgeQuote["intermediateGasFees"]>> {
    const fees: NonNullable<BridgeQuote["intermediateGasFees"]> = [];
    for (const step of laterSteps) {
      if (step.type !== "cosmos" || !step.gasFee) continue;
      const chainId = String(step.chainId);
      const chainAssets = await this.getAssets(chainId).catch(() => undefined);
      const asset = chainAssets?.[chainId]?.assets.find(
        (a) => a.denom === step.gasFee!.denom
      );
      // Never guess decimals for money: valuing a minimal-denom fee with
      // made-up precision misprices it by orders of magnitude (a 20000
      // uusdc fee read with 0 decimals displays as 20,000 USDC). If the
      // fee asset can't be resolved, fail the quote rather than mislead.
      if (!asset || asset.decimals == null) {
        throw new BridgeQuoteError({
          bridgeId: SkipBridgeProvider.ID,
          errorType: "CreateCosmosTxError",
          message: `Cannot resolve metadata for intermediate fee asset ${step.gasFee.denom} on ${chainId}`,
        });
      }
      fees.push({
        amount: step.gasFee.amount,
        denom: asset.symbol ?? step.gasFee.denom,
        address: step.gasFee.denom,
        decimals: asset.decimals,
        coinGeckoId: asset.coingecko_id,
      });
    }
    return fees;
  }

  /**
   * Returns the source/origin asset variants that can be used to reach a given chain and asset.
   *
   * Currently, just supports IBC shared origin assets. But can be expanded to support EVM-swappable assets
   * and CCTP variants.
   */
  async getSupportedAssets({
    chain,
    asset,
  }: GetBridgeSupportedAssetsParams): Promise<
    (BridgeChain & BridgeSupportedAsset)[]
  > {
    // Registry fetches live OUTSIDE the try/catch: their failures (registry
    // down, rate limited) must reject so the client's query retries and
    // re-polls. Everything below is pure lookup over the fetched data, where
    // a miss legitimately means "no route for this asset".
    const chainAsset = await this.getAsset(chain, asset);
    // Asset not in Skip's registry: unsupported by this provider, not an
    // outage. Resolve empty so other transfer options can render. This is a
    // normal condition (every provider is asked about every asset), so it is
    // deliberately not logged.
    if (!chainAsset) return [];

    // find variants
    const [assets, skipChains] = await Promise.all([
      this.getAssets(),
      this.getChains(),
    ]);

    try {
      // Use of toLowerCase is advised due to registry (Skip + others) differences
      // in casing of asset addresses. May be somewhat unsafe.
      // See original usage in `getAsset` method.
      const foundVariants = new BridgeAssetMap<
        BridgeChain & BridgeSupportedAsset
      >();

      // asset list counterparties
      const assetListAsset = this.ctx.assetLists
        .flatMap(({ assets }) => assets)
        .find(
          (a) =>
            a.coinMinimalDenom.toLowerCase() === asset.address.toLowerCase()
        );

      // Copy, never alias: assetLists is module-static and shared across
      // requests, and variantAssets below includes assetListAsset itself, so
      // pushing into the original array doubles it on every request until
      // the spread blows the argument limit ("Maximum call stack size
      // exceeded") and this provider returns empty until instance recycle.
      const counterparties = [...(assetListAsset?.counterparty ?? [])];
      // since skip supports cosmos swap, we can include other asset list
      // counterparties of the same variant
      if (assetListAsset) {
        const variantAssets = this.ctx.assetLists.flatMap(({ assets }) =>
          assets.filter(
            (asset) => asset.variantGroupKey === assetListAsset.variantGroupKey
          )
        );
        counterparties.push(
          ...variantAssets.flatMap((asset) => asset.counterparty)
        );
      }

      for (const counterparty of counterparties) {
        // check if supported by skip
        if (!("chainId" in counterparty)) continue;
        const address =
          "address" in counterparty
            ? counterparty.address
            : counterparty.sourceDenom;
        const skipCounterparty = assets[counterparty.chainId]?.assets.find(
          (a) =>
            counterparty.chainType === "evm" &&
            address === NativeEVMTokenConstantAddress
              ? /**
                 * Skip labels native tokens as "native" and uses the symbol of the counterparty
                 */
                a.denom.toLowerCase() === address.toLowerCase() ||
                (a.denom.includes("native") &&
                  a.symbol?.toLowerCase() === counterparty.symbol.toLowerCase())
              : a.denom.toLowerCase() === address.toLowerCase()
        );

        if (!skipCounterparty) continue;

        if (counterparty.chainType === "cosmos") {
          const c = counterparty as CosmosCounterparty;

          foundVariants.setAsset(c.chainId, address, {
            transferTypes: ["quote"],
            chainId: c.chainId,
            chainType: "cosmos",
            address: address,
            denom: c.symbol,
            decimals: c.decimals,
            coinGeckoId: skipCounterparty.coingecko_id,
          });
        }

        if (counterparty.chainType === "evm") {
          const c = counterparty as EVMCounterparty;

          foundVariants.setAsset(c.chainId.toString(), address, {
            transferTypes: ["quote"],
            chainId: c.chainId,
            chainType: "evm",
            address: address,
            denom: c.symbol,
            decimals: c.decimals,
            coinGeckoId: skipCounterparty.coingecko_id,
          });
        }
      }

      // IBC shared origin assets
      const sharedOriginAssets = Object.keys(assets).flatMap((chainID) => {
        const chainAssets = assets[chainID].assets;

        return chainAssets.filter((asset) => {
          const skipChain = skipChains.find(
            (c) => c.chain_id === asset.origin_chain_id
          );

          return (
            // All shared origin assets require Packet Forward Middleware (PFM) to be enabled
            // so assets can be forwarded to destination chain
            skipChain?.pfm_enabled &&
            asset.origin_denom.toLowerCase() ===
              chainAsset.origin_denom.toLowerCase() &&
            asset.origin_chain_id === chainAsset.origin_chain_id &&
            asset.denom.toLowerCase() !== chainAsset.denom.toLowerCase()
          );
        });
      });

      for (const sharedOriginAsset of sharedOriginAssets) {
        const chainInfo = sharedOriginAsset.is_evm
          ? {
              chainId: Number(sharedOriginAsset.chain_id),
              chainType: "evm" as const,
            }
          : !sharedOriginAsset.is_svm
          ? {
              chainId: sharedOriginAsset.chain_id as string,
              chainType: "cosmos" as const,
            }
          : undefined;

        if (!chainInfo) continue;

        foundVariants.setAsset(
          sharedOriginAsset.chain_id,
          sharedOriginAsset.denom,
          {
            ...chainInfo,
            transferTypes: ["quote"],
            address: sharedOriginAsset.denom,
            denom:
              sharedOriginAsset.recommended_symbol ??
              sharedOriginAsset.symbol ??
              sharedOriginAsset.name ??
              sharedOriginAsset.denom,
            decimals: sharedOriginAsset.decimals ?? asset.decimals,
            coinGeckoId: sharedOriginAsset.coingecko_id,
          }
        );
      }

      // TODO: when Skip supports new features
      // * CCTP variants
      // * EVM swappable variants

      return foundVariants.assets;
    } catch (e) {
      // Only pure lookup over already-fetched registry data can land here
      // (infra failures reject above, before the try), so a throw is always
      // a bug or malformed registry data, never a normal condition. Log it
      // in production too: a silent catch here hid the counterparty
      // mutation bug as unexplainable empty results for months.
      // Uses the already-resolved assets/skipChains from above: re-awaiting
      // the cachified getters here could itself throw (evicted entry plus a
      // failed refresh), which would escape this catch and turn the
      // intended empty-result degradation into a rejection.
      console.warn(
        `[Skip] supported-assets lookup threw for ${asset.address} on ${
          chain.chainId
        }: ${
          e instanceof Error ? e.message : String(e)
        }; unscoped registry chains=${
          Object.keys(assets ?? {}).length
        }, chain list=${skipChains?.length ?? 0}`
      );
      return [];
    }
  }

  async getTransactionData(
    params: GetBridgeQuoteParams
  ): Promise<BridgeTransactionRequest> {
    const quote = await this.getQuote(params);
    const transactionRequest = quote.transactionRequest!;
    const estimatedGasFee = await this.estimateGasFee(
      params,
      transactionRequest
    );
    return transactionRequest.type === "cosmos" && estimatedGasFee?.gas
      ? {
          ...transactionRequest,
          gasFee: {
            gas: estimatedGasFee.gas,
            denom: estimatedGasFee.address,
            amount: estimatedGasFee.amount,
          },
        }
      : transactionRequest;
  }

  async createTransaction(
    fromChainId: string,
    address: Address,
    messages: SkipMsg[]
  ) {
    for (const message of messages) {
      if ("evm_tx" in message) {
        return await this.createEvmTransaction(
          fromChainId,
          address,
          message.evm_tx
        );
      }

      if ("multi_chain_msg" in message) {
        return await this.createCosmosTransaction(message.multi_chain_msg);
      }
    }
  }

  /**
   * Builds the ordered user-signed steps of a multi-tx route, one per msg.
   * Later cosmos steps are quote-time drafts: their sender is the address
   * Skip derived from the quote's address list, so before signing they must
   * be rebuilt via `getTransactionStep` with the wallet's real address on
   * that chain.
   */
  async createTransactionSteps(
    evmSenderAddress: Address,
    messages: SkipMsg[],
    operations?: unknown[]
  ): Promise<BridgeTransactionStep[]> {
    const steps: BridgeTransactionStep[] = [];
    for (const [index, message] of messages.entries()) {
      if ("evm_tx" in message) {
        steps.push({
          ...(await this.createEvmTransaction(
            message.evm_tx.chain_id,
            evmSenderAddress,
            message.evm_tx
          )),
          chainId: Number(message.evm_tx.chain_id),
        });
      } else if ("multi_chain_msg" in message) {
        const chainId = message.multi_chain_msg.chain_id;
        const cosmosTx = await this.createCosmosTransaction(
          message.multi_chain_msg
        );
        const messageData = JSON.parse(message.multi_chain_msg.msg);
        // When the step pays fees in the asset the route delivers, the fee
        // must fit what the route reserves for it (msgs are one per tx, so
        // the msg's index is its tx_index in the operations).
        const feeDenom = this.ctx.chainList.find((c) => c.chain_id === chainId)
          ?.feeCurrencies?.[0]?.coinMinimalDenom;
        const feeBudget =
          operations && feeDenom
            ? this.getStepFeeBudget(
                operations,
                index,
                this.getMsgSpend(messageData, feeDenom),
                feeDenom
              )
            : undefined;
        // Estimate gas only for steps after the first: the first step's gas
        // is estimated by the caller through the regular quote path.
        const gasFee =
          index > 0
            ? await this.estimateCosmosStepGasFee(
                chainId,
                cosmosTx,
                messageData.sender,
                feeBudget
              )
            : undefined;
        steps.push({
          type: "cosmos",
          msgs: cosmosTx.msgs,
          gasFee,
          chainId,
        });
      }
    }
    return steps;
  }

  /**
   * Gas fee for an intermediate-chain cosmos step, sized to fit the funds
   * available to pay it when a `feeBudget` is known.
   *
   * The account may not exist or be funded yet (funds arrive with the prior
   * step), so simulation failures fall back to the msg's fallback gas limit.
   * The fee is first priced at the chain's default (safe-side high) gas
   * price; when the step's fee is paid from the arriving funds, the amount
   * available for it is fixed (the route reserves a flat amount on the
   * intermediate chain), and the safe-side price can exceed that reserve
   * even though the chain's minimum price fits. So when the safe-priced fee
   * exceeds the budget, it is repriced at the chain's minimum gas price and,
   * if still over, the gas limit is capped into the budget. A capped limit
   * without margin over what a real simulation measured cannot reliably
   * succeed, so that case
   * throws (`BridgeFeeExceedsBudgetMessage`) instead of building a
   * transaction doomed to fail; a fallback-derived limit is a deliberate
   * overestimate and may be capped freely. Returns undefined only when the
   * chain's fee token can't be resolved; signing then falls back to
   * wallet-side estimation.
   */
  async estimateCosmosStepGasFee(
    chainId: string,
    tx: CosmosBridgeTransactionRequest & { fallbackGasLimit?: number },
    senderAddress: string,
    feeBudget?: { denom: string; amount: string }
  ): Promise<CosmosBridgeTransactionRequest["gasFee"] | undefined> {
    const gasMultiplier = 1.5;

    let simulatedGas: number | undefined;
    try {
      const { gasUsed } = await simulateCosmosTxBody({
        chainId,
        chainList: this.ctx.chainList,
        body: {
          messages: await Promise.all(
            tx.msgs.map(async (msg) =>
              (await this.getProtoRegistry()).encodeAsAny(msg)
            )
          ),
        },
        bech32Address: senderAddress,
      });
      simulatedGas = gasUsed;
    } catch {
      // account not funded yet, LCD lagging the arrival, or simulation
      // unavailable: fall back to the msg's conservative gas limit below
    }
    const baseGas = simulatedGas ?? tx.fallbackGasLimit;
    if (!baseGas) return undefined;
    const gasLimit = Math.round(baseGas * gasMultiplier);

    // Price at the chain's default fee token without checking the account's
    // balances, which don't hold the funds yet at quote time.
    let feeDenom: string;
    let safePrice: Dec;
    try {
      ({ feeDenom, gasPrice: safePrice } = await getDefaultGasPrice({
        chainId,
        chainList: this.ctx.chainList,
      }));
    } catch {
      return undefined;
    }

    const priceGas = (gas: number, price: Dec) =>
      price.mul(new Dec(gas)).roundUp().toString();

    const safeFee = {
      gas: String(gasLimit),
      denom: feeDenom,
      amount: priceGas(gasLimit, safePrice),
    };
    if (!feeBudget || feeBudget.denom !== feeDenom) return safeFee;

    const budget = BigInt(feeBudget.amount);
    if (BigInt(safeFee.amount) <= budget) return safeFee;

    // The chain's minimum viable gas price: the registry's low step, except
    // on fee-market chains where the current dynamic price is the floor.
    const chain = this.ctx.chainList.find((c) => c.chain_id === chainId);
    const hasFeeMarket = Boolean(chain?.features?.includes("osmosis-txfees"));
    const lowStep = chain?.feeCurrencies?.find(
      (fc) => fc.coinMinimalDenom === feeDenom
    )?.gasPriceStep?.low;
    const minPrice =
      !hasFeeMarket && lowStep != null ? new Dec(String(lowStep)) : safePrice;

    const minPricedAmount = priceGas(gasLimit, minPrice);
    if (BigInt(minPricedAmount) <= budget) {
      return {
        gas: String(gasLimit),
        denom: feeDenom,
        amount: minPricedAmount,
      };
    }

    // Past here the budget cannot buy the full gas limit even at the floor
    // price, so the only remaining option is to cap the limit into it.
    //
    // A SIMULATED limit must never be capped. Simulation under-reports what
    // execution actually uses (measured 27% low on a live Noble step:
    // 94,028 simulated against 119,829 used), which is exactly why the
    // normal path applies `gasMultiplier`. Any cap below the full multiplied
    // limit re-enters the range where the transaction can run out of gas,
    // and an out-of-gas failure charges the fee, consumes the whole reserve,
    // and strands the funds with nothing left to fund a retry. Refuse
    // instead, with copy telling the user to top up the fee token.
    //
    // A FALLBACK limit has no simulation to under-report and is a
    // deliberate overestimate of a known message shape, so capping it is
    // safe and keeps quotes working when the account is not funded yet.
    const cappedGas = Number(
      new Dec(feeBudget.amount).quo(minPrice).truncate().toString()
    );
    if (simulatedGas === undefined && cappedGas > 0) {
      return {
        gas: String(cappedGas),
        denom: feeDenom,
        amount: priceGas(cappedGas, minPrice),
      };
    }

    throw new BridgeQuoteError({
      bridgeId: SkipBridgeProvider.ID,
      errorType: "CreateCosmosTxError",
      message: BridgeFeeExceedsBudgetMessage,
    });
  }

  /**
   * Funds available to pay an intermediate step's fee out of the assets the
   * route itself delivers: the amount arriving on the step's chain (the
   * previous transaction's final `amount_out`) minus what the step's built
   * msg spends. Positive only when the route reserves something for fees
   * (e.g. Skip holds back a flat amount on CCTP legs). Returns undefined
   * when the step doesn't spend the fee token (fees then come from the
   * account's own balance, checked elsewhere) or the route data doesn't
   * carry the amounts — callers then leave the fee uncapped.
   */
  protected getStepFeeBudget(
    operations: unknown[],
    txIndex: number,
    spend: { denom: string; amount: string } | undefined,
    feeDenom: string
  ): { denom: string; amount: string } | undefined {
    if (!spend || spend.denom !== feeDenom || txIndex <= 0) return undefined;
    let arrival: bigint | undefined;
    for (const operation of operations) {
      if (
        operation &&
        typeof operation === "object" &&
        (operation as { tx_index?: number }).tx_index === txIndex - 1
      ) {
        const amountOut = (operation as { amount_out?: string }).amount_out;
        if (typeof amountOut !== "string") continue;
        try {
          arrival = BigInt(amountOut);
        } catch {
          return undefined;
        }
      }
    }
    if (arrival === undefined) return undefined;
    let budget: bigint;
    try {
      budget = arrival - BigInt(spend.amount);
    } catch {
      return undefined;
    }
    if (budget <= BigInt(0)) return undefined;
    return { denom: spend.denom, amount: budget.toString() };
  }

  /** The amount a step's parsed msg spends in `feeDenom`, if any: the IBC
   *  transfer token or the matching cosmwasm funds entry. */
  protected getMsgSpend(
    messageData: unknown,
    feeDenom: string
  ): { denom: string; amount: string } | undefined {
    const data = messageData as {
      token?: { denom?: string; amount?: string };
      funds?: { denom?: string; amount?: string }[];
    };
    const candidates = data?.token ? [data.token] : data?.funds ?? [];
    const spend = candidates.find((coin) => coin?.denom === feeDenom);
    return spend?.denom && spend.amount
      ? { denom: spend.denom, amount: spend.amount }
      : undefined;
  }

  /** Balance of `denom` held by `address`, via the chain's registry LCD.
   *  Returns undefined when it can't be determined. */
  protected async getCosmosBalance(
    chainId: string,
    address: string,
    denom: string
  ): Promise<bigint | undefined> {
    const rest = this.ctx.chainList.find((c) => c.chain_id === chainId)?.apis
      ?.rest?.[0]?.address;
    if (!rest) return undefined;
    try {
      const { balance } = await apiClient<{ balance?: { amount?: string } }>(
        `${rest.replace(
          /\/$/,
          ""
        )}/cosmos/bank/v1beta1/balances/${address}/by_denom?denom=${encodeURIComponent(
          denom
        )}`
      );
      return BigInt(balance?.amount ?? "0");
    } catch {
      return undefined;
    }
  }

  /**
   * Rebuilds one intermediate-chain step of a multi-tx route for signing:
   * the ORIGINALLY QUOTED route's msgs refreshed (never a new route — after
   * the first tx has moved the funds, re-routing could select different
   * operations entirely), the wallet's real account on that chain as sender
   * (a bech32-converted address is invalid on chains with non-118 key
   * derivation, e.g. Injective), fresh timeout, fresh gas estimate.
   */
  async getTransactionStep(
    params: GetBridgeTransactionStepParams
  ): Promise<CosmosBridgeTransactionRequest> {
    const { step, fromChain, toChain } = params;

    const routeData = params.route as Partial<SkipMultiTxRouteData> | null;
    if (
      !routeData ||
      typeof routeData.source_asset_denom !== "string" ||
      typeof routeData.source_asset_chain_id !== "string" ||
      typeof routeData.dest_asset_denom !== "string" ||
      typeof routeData.dest_asset_chain_id !== "string" ||
      typeof routeData.amount_in !== "string" ||
      typeof routeData.amount_out !== "string" ||
      !Array.isArray(routeData.operations) ||
      !Array.isArray(routeData.required_chain_addresses)
    ) {
      throw new BridgeQuoteError({
        bridgeId: SkipBridgeProvider.ID,
        errorType: "CreateCosmosTxError",
        message: "Missing or invalid multi-tx route data for step rebuild",
      });
    }

    const addressList = await this.getAddressList(
      routeData.required_chain_addresses,
      params.fromAddress,
      params.toAddress,
      fromChain,
      toChain,
      { [step.chainId]: step.senderAddress }
    );

    const { msgs } = await this.skipClient
      .messages({
        address_list: addressList,
        source_asset_denom: routeData.source_asset_denom,
        source_asset_chain_id: routeData.source_asset_chain_id,
        dest_asset_denom: routeData.dest_asset_denom,
        dest_asset_chain_id: routeData.dest_asset_chain_id,
        amount_in: routeData.amount_in,
        amount_out: routeData.amount_out,
        // Stored routes embed relay fee quotes that expire ~30 minutes
        // after quoting, and Skip rejects a msgs build whose submitted
        // operations carry an expired one. Strip them so the rebuild works
        // however long the funds took to arrive (see helper doc below).
        operations: removeSmartRelayFeeQuotes(routeData.operations),
      })
      .catch((error) => {
        // Backstop should Skip still deem the stored route expired: name
        // the failure so the UI can show recovery copy instead of a
        // generic error.
        if (
          error instanceof Error &&
          /quote has expired/i.test(error.message)
        ) {
          throw new BridgeQuoteError({
            bridgeId: SkipBridgeProvider.ID,
            errorType: "CreateCosmosTxError",
            message: BridgeRouteExpiredMessage,
          });
        }
        throw error;
      });

    const stepMsg = msgs.find(
      (msg): msg is { multi_chain_msg: SkipMultiChainMsg } =>
        "multi_chain_msg" in msg &&
        msg.multi_chain_msg.chain_id === step.chainId
    );
    if (!stepMsg) {
      throw new BridgeQuoteError({
        bridgeId: SkipBridgeProvider.ID,
        errorType: "CreateCosmosTxError",
        message: `Route no longer includes a transaction on ${step.chainId}`,
      });
    }

    // The step must be signed by the wallet's own account: reject a build
    // whose sender is not the provided address rather than hand back a tx
    // the wallet cannot sign (or worse, one routing funds via an account
    // the user does not control).
    const messageData = JSON.parse(stepMsg.multi_chain_msg.msg);
    if (messageData.sender !== step.senderAddress) {
      throw new BridgeQuoteError({
        bridgeId: SkipBridgeProvider.ID,
        errorType: "CreateCosmosTxError",
        message: `Built step sender ${messageData.sender} does not match wallet address ${step.senderAddress} on ${step.chainId}`,
      });
    }

    const cosmosTx = await this.createCosmosTransaction(
      stepMsg.multi_chain_msg
    );

    // Fee budget for this step: the route's reserved amount is the floor,
    // improved by the account's live balance when that reads higher — the
    // balance includes the arrived funds plus any top-ups the user made, so
    // topping up the fee token genuinely raises what can be spent on fees.
    // A short or failed balance read never shrinks the budget below the
    // route's reserve (the read can lag the arrival).
    const feeDenom = this.ctx.chainList.find((c) => c.chain_id === step.chainId)
      ?.feeCurrencies?.[0]?.coinMinimalDenom;
    const spend = feeDenom
      ? this.getMsgSpend(messageData, feeDenom)
      : undefined;
    let feeBudget =
      feeDenom && spend
        ? this.getStepFeeBudget(
            routeData.operations,
            msgs.indexOf(stepMsg),
            spend,
            feeDenom
          )
        : undefined;
    if (feeDenom && spend) {
      const balance = await this.getCosmosBalance(
        step.chainId,
        step.senderAddress,
        feeDenom
      );
      if (balance !== undefined) {
        const liveBudget = balance - BigInt(spend.amount);
        if (liveBudget > BigInt(feeBudget?.amount ?? "0")) {
          feeBudget = { denom: feeDenom, amount: liveBudget.toString() };
        }
      }
    }

    const gasFee = await this.estimateCosmosStepGasFee(
      step.chainId,
      cosmosTx,
      step.senderAddress,
      feeBudget
    );

    return {
      type: "cosmos",
      msgs: cosmosTx.msgs,
      gasFee,
    };
  }

  async createCosmosTransaction(
    message: SkipMultiChainMsg
  ): Promise<CosmosBridgeTransactionRequest & { fallbackGasLimit?: number }> {
    const messageData = JSON.parse(message.msg);

    if ("contract" in messageData) {
      // is a cosmwasm contract call

      const cosmwasmData = messageData as {
        sender: string;
        contract: string;
        msg: object;
        funds: {
          denom: string;
          amount: string;
        }[];
      };

      const { typeUrl, value: msg } = await makeExecuteCosmwasmContractMsg({
        sender: cosmwasmData.sender,
        contract: cosmwasmData.contract,
        msg: cosmwasmData.msg,
        funds: cosmwasmData.funds,
      });

      return {
        type: "cosmos",
        msgs: [{ typeUrl, value: msg }],
        fallbackGasLimit: makeExecuteCosmwasmContractMsg.gas,
      };
    } else {
      // is an ibc transfer

      /**
       * Always use the receiver address to get the timeout height.
       * For chains with PFM enabled, the destination chain is not the same as
       * the toChain. Therefore, we need to derive the immediate next hop height.
       */
      const timeoutHeight = await this.ctx.getTimeoutHeight({
        destinationAddress: messageData.receiver,
      });

      const { typeUrl, value } = await makeIBCTransferMsg({
        sourcePort: messageData.source_port,
        sourceChannel: messageData.source_channel,
        token: {
          denom: messageData.token.denom,
          amount: messageData.token.amount,
        },
        sender: messageData.sender,
        receiver: messageData.receiver,
        // @ts-ignore
        timeoutHeight,
        timeoutTimestamp: messageData?.timeout_timestamp ?? BigInt(0),
        memo: messageData.memo,
      });

      return {
        type: "cosmos",
        msgs: [{ typeUrl, value }],
        fallbackGasLimit: makeIBCTransferMsg.gas,
      };
    }
  }

  async createEvmTransaction(
    chainID: string,
    sender: Address,
    message: SkipEvmTx
  ): Promise<EvmBridgeTransactionRequest> {
    let approvalTransactionRequest;
    if (message.required_erc20_approvals.length > 0) {
      approvalTransactionRequest = await this.getApprovalTransactionRequest(
        chainID,
        message.required_erc20_approvals[0].token_contract,
        sender,
        message.required_erc20_approvals[0].spender,
        message.required_erc20_approvals[0].amount
      );
    }

    return {
      type: "evm",
      to: message.to as Address,
      data: `0x${message.data}`,
      value: numberToHex(BigInt(message.value)),
      approvalTransactionRequest,
    };
  }

  private getViemProvider(chainID: string) {
    const evmChain = EthereumChainInfo.find(
      (chain) => chain.id.toString() === chainID
    );

    if (!evmChain) {
      throw new Error("Could not find EVM chain");
    }

    const provider = createPublicClient({
      chain: evmChain,
      transport: getEvmRpcTransport(evmChain, {
        timeout: 3_000,
        retryCount: 0,
      }),
    });

    return provider;
  }

  async getApprovalTransactionRequest(
    chainID: string,
    tokenAddress: Address,
    owner: Address,
    spender: Address,
    amount: string
  ): Promise<
    | {
        to: string;
        data: string;
      }
    | undefined
  > {
    const provider = this.getViemProvider(chainID);

    const allowance = await provider.readContract({
      abi: erc20Abi,
      address: tokenAddress,
      functionName: "allowance",
      args: [owner, spender],
    });

    if (BigInt(allowance.toString()) >= BigInt(amount)) {
      return;
    }

    const approveTxData = encodeFunctionData({
      abi: erc20Abi,
      functionName: "approve",
      args: [spender, BigInt(amount)],
    });

    return {
      to: tokenAddress,
      data: approveTxData,
    };
  }

  async getAsset(chain: BridgeChain, asset: BridgeAsset) {
    const chainID = chain.chainId.toString();

    const chainAssets = await this.getAssets(chainID);

    // A registry response that omits the requested chain is a lookup miss
    // ("no assets on this chain"), not an outage: guard it so callers see
    // "asset not found" rather than a TypeError rejection that clients
    // would classify as a provider failure and retry forever.
    for (const skipAsset of chainAssets[chainID]?.assets ?? []) {
      if (chain.chainType === "evm") {
        // For the chain's native EVM token, only match assets without token_contract.
        // For Ethereum specifically, Skip may have two ETH entries: one with token_contract
        // (not routable) and one without (native, which is routable).
        if (
          asset.address.toLowerCase() ===
          NativeEVMTokenConstantAddress.toLowerCase()
        ) {
          if (!skipAsset.token_contract) return skipAsset;
          continue;
        }

        // For ERC20 tokens, match by token_contract
        if (
          asset.address.toLowerCase() ===
          skipAsset.token_contract?.toLowerCase()
        ) {
          return skipAsset;
        }
      }

      if (chain.chainType === "cosmos") {
        if (asset.address.toLowerCase() === skipAsset.denom.toLowerCase()) {
          return skipAsset;
        }
      }
    }
  }

  getAssets(chainID?: string) {
    return cachified({
      cache: this.ctx.cache,
      key: SkipBridgeProvider.ID + `_assets_${chainID}`,
      ttl: 1000 * 60 * 30, // 30 minutes
      // A degraded registry response (e.g. a rate-limited 200 with an empty
      // body) must not be cached as 30 minutes of truth: an empty registry
      // reads as "asset unsupported" downstream, which silently bypasses the
      // client's retry and re-poll machinery (observed in QA as a Skip-only
      // asset intermittently rendering external-only). Failing the check
      // makes cachified throw instead, so it propagates as a provider
      // failure the client retries.
      getFreshValue: () =>
        this.skipClient.assets({
          chainID,
        }),
      checkValue: (value) => {
        // cachified types the checked value as {}; it is the fresh/cached
        // return of skipClient.assets. A scoped request must return the
        // requested chain with a POPULATED asset list: a genuinely
        // unsupported asset is a denom absent from a populated registry,
        // while a missing or empty chain entry is the degraded shape
        // (observed cached from a rate-limited upstream, reproducing the
        // success-with-empty bug). Unscoped requests must be non-empty.
        const registry = value as Awaited<ReturnType<SkipApiClient["assets"]>>;
        return (
          (chainID
            ? Boolean(registry?.[chainID]?.assets?.length)
            : Object.keys(registry ?? {}).length > 0) ||
          "degraded or empty Skip asset registry response"
        );
      },
    });
  }

  getChains() {
    return cachified({
      cache: this.ctx.cache,
      key: SkipBridgeProvider.ID + "_chains",
      ttl: 1000 * 60 * 30, // 30 minutes
      getFreshValue: () => this.skipClient.chains(),
      // see getAssets: never cache a degraded/empty registry response
      checkValue: (value) => {
        const chains = value as Awaited<ReturnType<SkipApiClient["chains"]>>;
        return (chains?.length ?? 0) > 0 || "empty Skip chains response";
      },
    });
  }

  async getAddressList(
    chainIDs: string[],
    fromAddress: string,
    toAddress: string,
    fromChain: BridgeChain,
    toChain: BridgeChain,
    /**
     * Wallet-provided addresses by chain id, taking precedence over the
     * bech32-derived fallback. Required for signing steps on chains whose
     * key derivation differs from the source address (e.g. Injective).
     */
    addressOverrides?: Record<string, string>
  ) {
    const [{ fromBech32, toBech32 }, allSkipChains] = await Promise.all([
      import("@cosmjs/encoding"),
      this.getChains(),
    ]);

    const sourceChain = allSkipChains.find((c) => c.chain_id === chainIDs[0]);
    if (!sourceChain) {
      throw new Error(`Failed to find chain ${chainIDs[0]}`);
    }

    const destinationChain = allSkipChains.find(
      (c) => c.chain_id === chainIDs[chainIDs.length - 1]
    );
    if (!destinationChain) {
      throw new Error(`Failed to find chain ${chainIDs[chainIDs.length - 1]}`);
    }

    const addressList = [];

    for (const chainID of chainIDs) {
      const chain = allSkipChains.find((c) => c.chain_id === chainID);
      if (!chain) {
        throw new Error(`Failed to find chain ${chainID}`);
      }

      const override = addressOverrides?.[chainID];
      if (override) {
        addressList.push(override);
        continue;
      }

      if (
        chain.chain_type === "evm" &&
        chain.chain_id === String(fromChain.chainId) &&
        fromChain.chainType === "evm"
      ) {
        addressList.push(fromAddress);
      }

      if (
        chain.chain_type === "evm" &&
        chain.chain_id === String(toChain.chainId) &&
        toChain.chainType === "evm"
      ) {
        addressList.push(toAddress);
      }

      if (
        chain.chain_type === "cosmos" &&
        chain.chain_id === String(fromChain.chainId) &&
        fromChain.chainType === "cosmos"
      ) {
        if (!chain.bech32_prefix) {
          throw new Error(`Chain ${chain.chain_id} is missing bech32_prefix`);
        }

        try {
          const decodedAddress = fromBech32(fromAddress);
          if (!decodedAddress?.data) {
            throw new Error(`Invalid bech32 address: ${fromAddress}`);
          }
          addressList.push(toBech32(chain.bech32_prefix, decodedAddress.data));
        } catch (error) {
          throw new Error(
            `Failed to convert address ${fromAddress} for chain ${
              chain.chain_id
            }: ${error instanceof Error ? error.message : String(error)}`
          );
        }
        continue;
      }

      if (
        chain.chain_type === "cosmos" &&
        chain.chain_id === String(toChain.chainId) &&
        toChain.chainType === "cosmos"
      ) {
        if (!chain.bech32_prefix) {
          throw new Error(`Chain ${chain.chain_id} is missing bech32_prefix`);
        }

        try {
          const decodedAddress = fromBech32(toAddress);
          if (!decodedAddress?.data) {
            throw new Error(`Invalid bech32 address: ${toAddress}`);
          }
          addressList.push(toBech32(chain.bech32_prefix, decodedAddress.data));
        } catch (error) {
          throw new Error(
            `Failed to convert address ${toAddress} for chain ${
              chain.chain_id
            }: ${error instanceof Error ? error.message : String(error)}`
          );
        }
        continue;
      }

      // This is likely a multi hop IBC, which means either
      // to or from chain & respective addresses can include a cosmos
      // bech32 address that can be used to derive the middle hop cosmos
      // chain address.
      if (chain.chain_type === "cosmos") {
        let bech32Address: string | null = null;
        if (fromChain.chainType === "cosmos") bech32Address = fromAddress;
        if (toChain.chainType === "cosmos") bech32Address = toAddress;
        if (!bech32Address) continue;

        if (!chain.bech32_prefix) {
          throw new Error(`Chain ${chain.chain_id} is missing bech32_prefix`);
        }

        try {
          const decodedAddress = fromBech32(bech32Address);
          if (!decodedAddress?.data) {
            throw new Error(`Invalid bech32 address: ${bech32Address}`);
          }
          addressList.push(toBech32(chain.bech32_prefix, decodedAddress.data));
        } catch (error) {
          throw new Error(
            `Failed to convert address ${bech32Address} for chain ${
              chain.chain_id
            }: ${error instanceof Error ? error.message : String(error)}`
          );
        }
      }
    }

    return addressList;
  }

  async estimateGasFee(
    params: GetBridgeQuoteParams,
    txData: BridgeTransactionRequest & { fallbackGasLimit?: number }
  ) {
    if (txData.type === "evm") {
      const evmChain = EthereumChainInfo.find(
        ({ id: chainId }) => chainId === params.fromChain.chainId
      );

      if (!evmChain)
        throw new Error(
          "Could not find EVM chain: " + params.fromChain.chainId
        );

      const provider = createPublicClient({
        chain: evmChain,
        transport: getEvmRpcTransport(evmChain, {
          timeout: 3_000,
          retryCount: 0,
        }),
      });

      const estimatedGas = await this.estimateEvmGasWithStateOverrides(
        provider,
        params,
        txData
      );
      if (estimatedGas === BigInt(0)) {
        return;
      }

      // Price gas at the wallet's worst case: wallets sign EIP-1559 txs
      // budgeting maxFeePerGas (~2x base fee + tip), so a max-amount input
      // clamped by a legacy eth_gasPrice estimate (~base + tip) still
      // overshoots the sender's balance at signing time.
      const gasPrice = await provider
        .estimateFeesPerGas()
        .then((fees) => fees.maxFeePerGas)
        .catch(() => provider.getGasPrice());

      if (!gasPrice) {
        throw new Error("Failed to get gas price");
      }

      const gasCost = estimatedGas * gasPrice;

      return {
        amount: gasCost.toString(),
        denom: evmChain.nativeCurrency.symbol,
        decimals: evmChain.nativeCurrency.decimals,
        address: NativeEVMTokenConstantAddress,
      };
    }

    if (txData.type === "cosmos") {
      const txSimulation = await estimateGasFee({
        chainId: params.fromChain.chainId.toString(),
        chainList: this.ctx.chainList,
        body: {
          messages: await Promise.all(
            txData.msgs.map(async (msg) =>
              (await this.getProtoRegistry()).encodeAsAny(msg)
            )
          ),
        },
        bech32Address: params.fromAddress,
        fallbackGasLimit: txData.fallbackGasLimit,
      }).catch((e) => {
        if (
          e instanceof Error &&
          e.message.includes(
            "No fee tokens found with sufficient balance on account"
          )
        ) {
          throw new BridgeQuoteError({
            bridgeId: SkipBridgeProvider.ID,
            errorType: "InsufficientAmountError",
            message: e.message,
          });
        } else if (
          e instanceof Error &&
          e.message.includes("account") &&
          e.message.includes("not found")
        ) {
          throw new BridgeQuoteError({
            bridgeId: SkipBridgeProvider.ID,
            errorType: "AccountNotFoundError",
            message: e.message,
          });
        }

        throw e;
      });

      const gasFee = txSimulation.amount[0];
      const chainAssets = await this.getAssets();
      const { assets } = chainAssets[params.fromChain.chainId.toString()];

      const gasAsset = assets?.find((asset) => asset.denom === gasFee.denom);

      return {
        gas: txSimulation.gas,
        amount: gasFee.amount,
        denom: gasAsset?.symbol ?? gasFee.denom,
        decimals: gasAsset?.decimals ?? 0,
        address: gasAsset?.denom ?? gasFee.denom,
        coinGeckoId: gasAsset?.coingecko_id,
      };
    }
  }

  /** @returns 0 gas if state overrides fail. */
  async estimateEvmGasWithStateOverrides(
    provider: ReturnType<typeof createPublicClient>,
    params: GetBridgeQuoteParams,
    txData: EvmBridgeTransactionRequest
  ) {
    try {
      // Override the sender's balance to cover the tx value plus gas so the
      // estimate prices the tx even when the wallet can't currently fund it.
      // Skip charges additive bridge fees inside the tx value, so a max-amount
      // input always exceeds the balance and the node would otherwise reject
      // the estimate with "insufficient funds". Affordability is checked
      // client-side against this estimate, not here.
      const balanceOverride = {
        address: params.fromAddress as Address,
        balance:
          (!isNil(txData.value) ? BigInt(txData.value) : BigInt(0)) +
          // 1 native token (18 decimals) of headroom for the gas cost itself
          BigInt("1000000000000000000"),
      };

      if (!txData.approvalTransactionRequest) {
        return await provider
          .estimateGas({
            account: params.fromAddress as Address,
            to: txData.to,
            data: txData.data,
            value: !isNil(txData.value) ? BigInt(txData.value) : undefined,
            stateOverride: [balanceOverride],
          })
          .then((gas) => BigInt(gas));
      }

      // Adding a stateDiff override allows us to estimate the gas without the user having first approved the ERC20 transfer
      // Otherwise, the estimate call would fail with an error indicating the user has not approved the transfer

      /* Allowance slot (differs from contract to contract but is usually 10) */
      const slot = 10;

      const erc20Balance = keccak256(
        encodePacked(
          ["uint256", "uint256"],
          [BigInt(params.fromAddress), BigInt(slot)]
        )
      );
      const index = keccak256(
        encodePacked(
          ["uint256", "uint256"],
          [BigInt(txData.to), BigInt(erc20Balance)]
        )
      );

      return await provider
        .estimateGas({
          account: params.fromAddress as Address,
          to: txData.to,
          data: txData.data,
          value: !isNil(txData.value) ? BigInt(txData.value) : undefined,
          stateOverride: [
            balanceOverride,
            {
              address: txData.approvalTransactionRequest.to as Address,
              stateDiff: [
                {
                  slot: index,
                  value: `0x${maxUint256.toString(16)}`,
                },
              ],
            },
          ],
        })
        .then((gas) => BigInt(gas));
    } catch (err) {
      console.error("failed to estimate gas:", err);
      return BigInt(0);
    }
  }

  async getProtoRegistry() {
    if (!this.protoRegistry) {
      const [{ ibcProtoRegistry, cosmwasmProtoRegistry }, { Registry }] =
        await Promise.all([
          import("@osmosis-labs/proto-codecs"),
          import("@cosmjs/proto-signing"),
        ]);
      this.protoRegistry = new Registry([
        ...ibcProtoRegistry,
        ...cosmwasmProtoRegistry,
      ]);
    }

    return this.protoRegistry;
  }

  async getExternalUrl({
    fromChain,
    toChain,
    fromAsset,
    toAsset,
  }: GetBridgeExternalUrlParams): Promise<BridgeExternalUrl | undefined> {
    if (this.ctx.env === "testnet") return undefined;

    const url = new URL("https://go.skip.build/");
    if (fromChain?.chainId) {
      url.searchParams.set("src_chain", String(fromChain.chainId));
    }
    if (fromAsset?.address) {
      url.searchParams.set("src_asset", fromAsset.address.toLowerCase());
    }
    if (toChain?.chainId) {
      url.searchParams.set("dest_chain", String(toChain.chainId));
    }
    if (toAsset?.address) {
      url.searchParams.set("dest_asset", toAsset.address.toLowerCase());
    }

    return { urlProviderName: "Skip:Go", url };
  }
}

/**
 * Removes every `smart_relay_fee_quote` field, at any depth, from a stored
 * route's operations before they are replayed against the msgs endpoint.
 *
 * Skip attaches the quote (with an `expiration` roughly 30 minutes out) to
 * operations its smart relay carries, and rejects any msgs request whose
 * submitted operations hold an expired quote — even though the relay fee
 * was already collected by the transaction that started the route.
 * Submitting the same operations without the quote is accepted and yields
 * identical msgs (verified against the live API), so rebuilt steps stay
 * signable no matter how long the intermediate funds took to arrive.
 */
export function removeSmartRelayFeeQuotes<T>(value: T): T {
  if (Array.isArray(value)) {
    return value.map(removeSmartRelayFeeQuotes) as T;
  }
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>)
        .filter(([key]) => key !== "smart_relay_fee_quote")
        .map(([key, entry]) => [key, removeSmartRelayFeeQuotes(entry)])
    ) as T;
  }
  return value;
}

export * from "./client";
export * from "./transfer-status";
