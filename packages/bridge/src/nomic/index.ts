import type { Registry } from "@cosmjs/proto-signing";
import { getRouteTokenOutGivenIn } from "@osmosis-labs/server";
import {
  estimateGasFee,
  getSwapMessages,
  makeSkipIbcHookSwapMemo,
  SkipSwapIbcHookContractAddress,
} from "@osmosis-labs/tx";
import { IbcTransferMethod } from "@osmosis-labs/types";
import { Dec, RatePretty } from "@osmosis-labs/unit";
import {
  deriveCosmosAddress,
  getAllBtcMinimalDenom,
  getnBTCMinimalDenom,
  getNomicRelayerUrl,
  isCosmosAddressValid,
  timeout,
} from "@osmosis-labs/utils";
import {
  BaseDepositOptions,
  buildDestination,
  Checkpoint,
  DepositInfo,
  generateDepositAddressIbc,
  getCheckpoint,
  getPendingDeposits,
  IbcDepositOptions,
} from "nomic-bitcoin";

import { BridgeQuoteError } from "../errors";
import { IbcBridgeProvider } from "../ibc";
import {
  BridgeAsset,
  BridgeChain,
  BridgeDepositAddress,
  BridgeExternalUrl,
  BridgeProvider,
  BridgeProviderContext,
  BridgeQuote,
  BridgeSupportedAsset,
  BridgeTransactionRequest,
  GetBridgeExternalUrlParams,
  GetBridgeQuoteParams,
  GetBridgeSupportedAssetsParams,
  GetDepositAddressParams,
} from "../interface";
import { getGasAsset } from "../utils/gas";
import { getLaunchDarklyFlagValue } from "../utils/launchdarkly";
import { NomicProviderId } from "./utils";

export class NomicBridgeProvider implements BridgeProvider {
  static readonly ID = NomicProviderId;
  readonly providerName = NomicBridgeProvider.ID;

  readonly relayers: string[];
  readonly nBTCMinimalDenom: string;
  readonly allBtcMinimalDenom: string | undefined;
  protected protoRegistry: Registry | null = null;

  constructor(protected readonly ctx: BridgeProviderContext) {
    this.relayers = getNomicRelayerUrl({ env: this.ctx.env });
    this.allBtcMinimalDenom = getAllBtcMinimalDenom({ env: this.ctx.env });
    this.nBTCMinimalDenom = getnBTCMinimalDenom({
      env: this.ctx.env,
    });
  }

  async getQuote(params: GetBridgeQuoteParams): Promise<BridgeQuote> {
    const { fromAddress, toChain, toAddress, fromAsset, fromAmount } = params;

    if (toChain.chainId !== "bitcoin") {
      throw new BridgeQuoteError({
        bridgeId: "Nomic",
        errorType: "UnsupportedQuoteError",
        message: "Only Bitcoin is supported as a destination chain.",
      });
    }

    const destMemo = buildDestination({
      bitcoinAddress: toAddress,
    });

    const nomicBtc = this.ctx.assetLists
      .flatMap(({ assets }) => assets)
      .find(
        ({ coinMinimalDenom }) => coinMinimalDenom === this.nBTCMinimalDenom
      );

    if (!nomicBtc) {
      throw new BridgeQuoteError({
        bridgeId: "Nomic",
        errorType: "UnsupportedQuoteError",
        message: "Nomic Bitcoin asset not found in asset list.",
      });
    }

    const transferMethod = nomicBtc.transferMethods.find(
      (method): method is IbcTransferMethod => method.type === "ibc"
    );

    if (!transferMethod) {
      throw new BridgeQuoteError({
        bridgeId: "Nomic",
        errorType: "UnsupportedQuoteError",
        message: "IBC transfer method not found for Nomic Bitcoin asset.",
      });
    }

    const nomicChain = this.ctx.chainList.find(
      ({ chain_name }) => chain_name === transferMethod.counterparty.chainName
    );

    if (!nomicChain) {
      throw new BridgeQuoteError({
        bridgeId: "Nomic",
        errorType: "UnsupportedQuoteError",
        message: "Nomic chain not found in chain list.",
      });
    }

    let swapMessages: Awaited<ReturnType<typeof getSwapMessages>>;
    let swapRoute:
      | Awaited<ReturnType<typeof getRouteTokenOutGivenIn>>
      | undefined;

    if (
      fromAsset.address.toLowerCase() === this.allBtcMinimalDenom?.toLowerCase()
    ) {
      swapRoute = await getRouteTokenOutGivenIn({
        assetLists: this.ctx.assetLists,
        tokenInAmount: fromAmount,
        tokenInDenom: fromAsset.address,
        tokenOutDenom: this.nBTCMinimalDenom,
      });

      swapMessages = await getSwapMessages({
        coinAmount: fromAmount,
        maxSlippage: "0.005",
        quote: swapRoute,
        tokenInCoinDecimals: fromAsset.decimals,
        tokenInCoinMinimalDenom: fromAsset.address,
        tokenOutCoinDecimals: nomicBtc.decimals,
        tokenOutCoinMinimalDenom: nomicBtc.coinMinimalDenom,
        userOsmoAddress: fromAddress,
        quoteType: "out-given-in",
      });
    } else {
      swapMessages = [];
      swapRoute = undefined;
    }

    if (!swapMessages) {
      throw new BridgeQuoteError({
        bridgeId: "Nomic",
        errorType: "CreateCosmosTxError",
        message: "Failed to get swap messages.",
      });
    }
    const nomicBridgeAsset: BridgeAsset = {
      address: nomicBtc.coinMinimalDenom,
      decimals: nomicBtc.decimals,
      denom: nomicBtc.symbol,
      coinGeckoId: nomicBtc.coingeckoId,
    };
    const ibcProvider = new IbcBridgeProvider(this.ctx);

    const transactionDataParams: GetBridgeQuoteParams = {
      ...params,
      fromAmount: !!swapRoute
        ? swapRoute.amount.toCoin().amount
        : params.fromAmount,
      fromAsset: nomicBridgeAsset,
      toChain: {
        chainId: nomicChain.chain_id,
        chainType: "cosmos",
        chainName: nomicChain.pretty_name,
      },
      toAsset: nomicBridgeAsset,
      toAddress: deriveCosmosAddress({
        address: fromAddress,
        desiredBech32Prefix: "nomic",
      }),
    };

    const [ibcTxMessages, ibcEstimatedTimeSeconds, nomicCheckpoint] =
      await Promise.all([
        ibcProvider.getTxMessages({
          ...transactionDataParams,
          memo: destMemo,
        }),
        ibcProvider.estimateTransferTime(
          transactionDataParams.fromChain.chainId.toString(),
          transactionDataParams.toChain.chainId.toString()
        ),
        getCheckpoint({
          relayers: this.relayers,
          bitcoinNetwork: this.ctx.env === "mainnet" ? "bitcoin" : "testnet",
        }),
      ]);

    // 4 hours
    const nomicEstimatedTimeSeconds = 4 * 60 * 60;

    const transferFeeInSats = Math.ceil(
      (nomicCheckpoint as Checkpoint & { minerFee: number }).minerFee * 64 + 546
    );
    const transferFeeInMicroSats = transferFeeInSats * 1e6;

    const msgs = [...swapMessages, ...ibcTxMessages];

    const txSimulation = await estimateGasFee({
      chainId: params.fromChain.chainId as string,
      chainList: this.ctx.chainList,
      body: {
        messages: await Promise.all(
          msgs.map(async (msg) =>
            (await this.getProtoRegistry()).encodeAsAny(msg)
          )
        ),
      },
      bech32Address: params.fromAddress,
    }).catch((e) => {
      if (
        e instanceof Error &&
        e.message.includes(
          "No fee tokens found with sufficient balance on account"
        )
      ) {
        throw new BridgeQuoteError({
          bridgeId: NomicBridgeProvider.ID,
          errorType: "InsufficientAmountError",
          message: e.message,
        });
      }

      throw e;
    });

    const gasFee = txSimulation.amount[0];
    const gasAsset = await getGasAsset({
      fromChainId: params.fromChain.chainId as string,
      denom: gasFee.denom,
      assetLists: this.ctx.assetLists,
      chainList: this.ctx.chainList,
      cache: this.ctx.cache,
    });

    return {
      input: {
        amount: params.fromAmount,
        ...params.fromAsset,
      },
      expectedOutput: {
        amount: (!!swapRoute
          ? new Dec(swapRoute.amount.toCoin().amount)
          : new Dec(params.fromAmount)
        )
          // Use micro sats because the amount will always be nomic btc which has 14 decimals (micro sats)
          .sub(new Dec(transferFeeInMicroSats))
          .toString(),
        ...nomicBridgeAsset,
        denom: "BTC",
        priceImpact: swapRoute?.priceImpactTokenOut?.toDec().toString() ?? "0",
      },
      fromChain: params.fromChain,
      toChain: params.toChain,
      transferFee: {
        ...params.fromAsset,
        denom: "BTC",
        chainId: params.fromChain.chainId,
        amount: (params.fromAsset.decimals === 14
          ? transferFeeInMicroSats
          : transferFeeInSats
        ).toString(),
      },
      estimatedTime: ibcEstimatedTimeSeconds + nomicEstimatedTimeSeconds,
      estimatedGasFee: gasFee
        ? {
            address: gasAsset?.address ?? gasFee.denom,
            denom: gasAsset?.denom ?? gasFee.denom,
            decimals: gasAsset?.decimals ?? 0,
            coinGeckoId: gasAsset?.coinGeckoId,
            amount: gasFee.amount,
          }
        : undefined,
      transactionRequest: {
        type: "cosmos",
        msgs,
        gasFee: {
          gas: txSimulation.gas,
          amount: gasFee.amount,
          denom: gasFee.denom,
        },
      },
    };
  }

  async getDepositAddress({
    fromChain,
    toAddress,
    toAsset,
  }: GetDepositAddressParams): Promise<BridgeDepositAddress> {
    if (!isCosmosAddressValid({ address: toAddress, bech32Prefix: "osmo" })) {
      throw new BridgeQuoteError({
        bridgeId: "Nomic",
        errorType: "UnsupportedQuoteError",
        message: "Invalid Cosmos address",
      });
    }

    const nomicBtc = this.ctx.assetLists
      .flatMap(({ assets }) => assets)
      .find(
        ({ coinMinimalDenom }) => coinMinimalDenom === this.nBTCMinimalDenom
      );

    if (!nomicBtc) {
      throw new BridgeQuoteError({
        bridgeId: "Nomic",
        errorType: "UnsupportedQuoteError",
        message: "Nomic Bitcoin asset not found in asset list.",
      });
    }

    const nomicIbcTransferMethod = nomicBtc.transferMethods.find(
      (method): method is IbcTransferMethod => method.type === "ibc"
    );

    if (!nomicIbcTransferMethod) {
      throw new BridgeQuoteError({
        bridgeId: "Nomic",
        errorType: "UnsupportedQuoteError",
        message: "IBC transfer method not found for Nomic Bitcoin asset.",
      });
    }

    if (fromChain.chainId !== "bitcoin") {
      throw new BridgeQuoteError({
        bridgeId: "Nomic",
        errorType: "UnsupportedQuoteError",
        message: "Only Bitcoin is supported as a source chain.",
      });
    }

    const nomicChain = this.ctx.chainList.find(
      ({ chain_name }) =>
        chain_name === nomicIbcTransferMethod.counterparty.chainName
    );

    if (!nomicChain) {
      throw new BridgeQuoteError({
        bridgeId: "Nomic",
        errorType: "UnsupportedQuoteError",
        message: "Nomic chain not found in chain list.",
      });
    }

    const userWantsAllBtc =
      this.allBtcMinimalDenom && toAsset.address === this.allBtcMinimalDenom;

    const now = Date.now();
    const timeoutTimestampFiveDaysFromNow =
      Number(now + 86_400 * 5 * 1_000 - (now % (60 * 60 * 1_000))) * 1_000_000;
    const swapMemo = userWantsAllBtc
      ? makeSkipIbcHookSwapMemo({
          denomIn: this.nBTCMinimalDenom,
          denomOut:
            this.ctx.env === "mainnet" ? this.allBtcMinimalDenom : "uosmo",
          env: this.ctx.env,
          minAmountOut: "1",
          poolId:
            this.ctx.env === "mainnet"
              ? "1868" // nBTC/allBTC pool on Osmosis
              : "663", // nBTC/osmo pool on Osmosis. Since there's no alloyed btc in testnet, we'll use these pool instead
          receiverOsmoAddress: toAddress,
          timeoutTimestamp: timeoutTimestampFiveDaysFromNow,
        })
      : undefined;

    const depositInfo = await generateDepositAddressIbc({
      relayers: this.relayers,
      channel: nomicIbcTransferMethod.counterparty.channelId, // IBC channel ID on Nomic
      bitcoinNetwork: this.ctx.env === "testnet" ? "testnet" : "bitcoin",
      sender: deriveCosmosAddress({
        address: toAddress,
        desiredBech32Prefix: nomicChain.bech32_prefix,
      }),
      receiver:
        userWantsAllBtc && swapMemo ? swapMemo.wasm.contract : toAddress,
      ...(swapMemo ? { memo: JSON.stringify(swapMemo) } : {}),
    });

    if (depositInfo.code === 1) {
      throw new BridgeQuoteError({
        bridgeId: "Nomic",
        errorType: "NoQuotesError",
        message:
          "Failed to generate deposit address. Cause: " + depositInfo.reason,
      });
    }

    if (depositInfo.code === 2) {
      throw new BridgeQuoteError({
        bridgeId: "Nomic",
        errorType: "NoQuotesError",
        message: "Failed to generate deposit address. Bridge at capacity",
      });
    }

    if (depositInfo.code !== 0) {
      throw new BridgeQuoteError({
        bridgeId: "Nomic",
        errorType: "UnsupportedQuoteError",
        message:
          "Failed to generate deposit address. Unknown error code: " +
          // @ts-expect-error
          depositInfo.code,
      });
    }

    return {
      depositAddress: depositInfo.bitcoinAddress,
      expirationTimeMs: depositInfo.expirationTimeMs,
      minimumDeposit: {
        address: nomicBtc.coinMinimalDenom,
        amount: (
          1000 / (1 - depositInfo.bridgeFeeRate) +
          depositInfo.minerFeeRate * 1e8
        ).toString(),
        decimals: 8,
        denom: "BTC",
        coinGeckoId: nomicBtc.coingeckoId,
      },
      networkFee: {
        address: nomicBtc.coinMinimalDenom,
        amount: (depositInfo.minerFeeRate * 1e8).toString(),
        decimals: 8,
        denom: "BTC",
        coinGeckoId: nomicBtc.coingeckoId,
      },
      providerFee: new RatePretty(new Dec(depositInfo.bridgeFeeRate)),
      estimatedTime: "transfer.nomic.estimatedTime", // About 1 hour
    };
  }

  async getSupportedAssets({
    asset,
    direction,
  }: GetBridgeSupportedAssetsParams): Promise<
    (BridgeChain & BridgeSupportedAsset)[]
  > {
    const assetListAsset = this.ctx.assetLists
      .flatMap(({ assets }) => assets)
      .find(
        (a) => a.coinMinimalDenom.toLowerCase() === asset.address.toLowerCase()
      );

    if (assetListAsset) {
      const bitcoinCounterparty = assetListAsset.counterparty.some(
        (c) => c.chainName === "bitcoin"
      );

      const isNomicBtc =
        assetListAsset.coinMinimalDenom.toLowerCase() ===
        this.nBTCMinimalDenom.toLowerCase();
      const isAllBtc =
        this.allBtcMinimalDenom &&
        assetListAsset.coinMinimalDenom.toLowerCase() ===
          this.allBtcMinimalDenom.toLowerCase();

      const nomicWithdrawEnabled = await getLaunchDarklyFlagValue({
        key: "nomicWithdrawAmount",
      });

      if (bitcoinCounterparty || isNomicBtc) {
        let transferTypes: BridgeSupportedAsset["transferTypes"] = [];

        if (direction === "withdraw" && nomicWithdrawEnabled) {
          transferTypes = ["quote"];
        } else if (direction === "deposit" && (isNomicBtc || isAllBtc)) {
          transferTypes = ["deposit-address"];
        }

        if (transferTypes.length === 0) {
          return [];
        }

        return [
          {
            transferTypes,
            chainId: "bitcoin",
            chainName: "Bitcoin",
            chainType: "bitcoin",
            denom: "BTC",
            address: "sat",
            decimals: 8,
          },
        ];
      }
    }

    return [];
  }

  async getTransactionData(): Promise<BridgeTransactionRequest> {
    throw new Error("Nomic transactions are currently not supported.");
  }

  async getExternalUrl({
    fromChain,
    toChain,
  }: GetBridgeExternalUrlParams): Promise<BridgeExternalUrl | undefined> {
    const url = new URL("https://app.nomic.io/bitcoin");

    if (fromChain?.chainType === "bitcoin") {
      url.searchParams.set("deposit", "confirmation");
    } else if (toChain?.chainType === "bitcoin") {
      url.searchParams.set("withdraw", "address");
    }

    return {
      urlProviderName: "Nomic",
      url,
    };
  }

  async getPendingDeposits({ address }: { address: string }) {
    try {
      const [pendingDeposits, skipSwapPendingDeposits] = await Promise.all([
        timeout(() => getPendingDeposits(this.relayers, address), 10000)(),
        /**
         * We need to check all deposits to skip contract since we set the receiver to the skip contract address.
         * So, we need to filter out any deposits that are not intended for the user.
         */
        timeout(
          () =>
            getPendingDeposits(this.relayers, SkipSwapIbcHookContractAddress),
          10000
        )(),
      ]);

      /**
       * Filter out deposits that are not intended for the user
       */
      const filteredSkipSwapPendingDeposits = skipSwapPendingDeposits
        .filter((deposit) => {
          try {
            if (!("dest" in deposit)) return false;
            const dest = deposit.dest as {
              data: BaseDepositOptions & IbcDepositOptions;
            };
            const memo = JSON.parse(dest.data.memo ?? "{}");
            return (
              memo.wasm.msg.swap_and_action.post_swap_action.transfer
                .to_address === address
            );
          } catch (error) {
            console.error("Error parsing memo:", error);
            return false;
          }
        })
        .map((deposit) => ({
          ...deposit,
          __type: "contract-deposit" as const,
        }));

      const nomicBtc = this.ctx.assetLists
        .flatMap(({ assets }) => assets)
        .find(
          ({ coinMinimalDenom }) => coinMinimalDenom === this.nBTCMinimalDenom
        );

      if (!nomicBtc) {
        throw new Error("Nomic Bitcoin asset not found in asset list.");
      }

      const deposits = [
        ...pendingDeposits,
        ...filteredSkipSwapPendingDeposits,
      ] as (DepositInfo & { __type?: "contract-deposit" })[];

      return deposits.map((deposit) => ({
        transactionId: deposit.txid,
        amount: deposit.amount,
        confirmations: deposit.confirmations,
        networkFee: {
          address: nomicBtc.coinMinimalDenom,
          amount: ((deposit.minerFeeRate ?? 0) * 1e8).toString(),
          decimals: 8,
          denom:
            deposit.__type === "contract-deposit" ? "BTC" : nomicBtc.symbol,
          coinGeckoId: nomicBtc.coingeckoId,
        },
        providerFee: {
          address: nomicBtc.coinMinimalDenom,
          amount: ((deposit.bridgeFeeRate ?? 0) * deposit.amount).toString(),
          decimals: 8,
          denom:
            deposit.__type === "contract-deposit" ? "BTC" : nomicBtc.symbol,
          coinGeckoId: nomicBtc.coingeckoId,
        },
      }));
    } catch (error) {
      console.error("Error getting pending Nomic deposits:", error);
      return [];
    }
  }

  async getProtoRegistry() {
    if (!this.protoRegistry) {
      const [{ ibcProtoRegistry, osmosisProtoRegistry }, { Registry }] =
        await Promise.all([
          import("@osmosis-labs/proto-codecs"),
          import("@cosmjs/proto-signing"),
        ]);
      this.protoRegistry = new Registry([
        ...ibcProtoRegistry,
        ...osmosisProtoRegistry,
      ]);
    }
    return this.protoRegistry;
  }
}
