import type { Registry } from "@cosmjs/proto-signing";
import { Dec, RatePretty } from "@keplr-wallet/unit";
import { getRouteTokenOutGivenIn } from "@osmosis-labs/server";
import { estimateGasFee, getSwapMessages } from "@osmosis-labs/tx";
import { IbcTransferMethod } from "@osmosis-labs/types";
import {
  deriveCosmosAddress,
  isCosmosAddressValid,
  timeout,
} from "@osmosis-labs/utils";
import {
  buildDestination,
  generateDepositAddressIbc,
  getPendingDeposits,
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

export class NomicBridgeProvider implements BridgeProvider {
  static readonly ID = "Nomic";
  readonly providerName = NomicBridgeProvider.ID;

  readonly relayers: string[];
  readonly nBTCMinimalDenom: string;
  protected protoRegistry: Registry | null = null;

  constructor(protected readonly ctx: BridgeProviderContext) {
    this.nBTCMinimalDenom =
      this.ctx.env === "mainnet"
        ? "ibc/75345531D87BD90BF108BE7240BD721CB2CB0A1F16D4EBA71B09EC3C43E15C8F" // nBTC
        : "ibc/72D483F0FD4229DBF3ACC78E648F0399C4ACADDFDBCDD9FE791FEE4443343422"; // Testnet nBTC
    this.relayers =
      this.ctx.env === "testnet"
        ? ["https://testnet-relayer.nomic.io:8443"]
        : ["https://relayer.nomic.mappum.io:8443"];
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

    if (fromAsset.address !== this.nBTCMinimalDenom) {
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

    const [ibcTxMessages, estimatedTime] = await Promise.all([
      ibcProvider.getTxMessages({
        ...transactionDataParams,
        memo: destMemo,
      }),
      ibcProvider.estimateTransferTime(
        transactionDataParams.fromChain.chainId.toString(),
        transactionDataParams.toChain.chainId.toString()
      ),
    ]);

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
        amount: !!swapRoute
          ? swapRoute.amount.toCoin().amount
          : params.fromAmount,
        ...nomicBridgeAsset,
        denom: "BTC",
        priceImpact: swapRoute?.priceImpactTokenOut?.toDec().toString() ?? "0",
      },
      fromChain: params.fromChain,
      toChain: params.toChain,
      // currently subsidized by relayers, but could be paid by user in future by charging the user the gas cost of
      transferFee: {
        ...params.fromAsset,
        chainId: params.fromChain.chainId,
        amount: "0",
      },
      estimatedTime,
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

    if (fromChain.chainId !== "bitcoin") {
      throw new BridgeQuoteError({
        bridgeId: "Nomic",
        errorType: "UnsupportedQuoteError",
        message: "Only Bitcoin is supported as a source chain.",
      });
    }

    const depositInfo = await generateDepositAddressIbc({
      relayers: this.relayers,
      channel: transferMethod.counterparty.channelId, // IBC channel ID on Nomic
      bitcoinNetwork: this.ctx.env === "testnet" ? "testnet" : "bitcoin",
      receiver: toAddress,
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

      const nomicWithdrawAmountEnabled = await getLaunchDarklyFlagValue({
        key: "nomicWithdrawAmount",
      });

      if (bitcoinCounterparty || isNomicBtc) {
        return [
          {
            transferTypes:
              direction === "withdraw" && nomicWithdrawAmountEnabled
                ? ["quote"]
                : ["deposit-address"],
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
      const pendingDeposits = await timeout(
        () => getPendingDeposits(this.relayers, address),
        10000
      )();

      const nomicBtc = this.ctx.assetLists
        .flatMap(({ assets }) => assets)
        .find(
          ({ coinMinimalDenom }) => coinMinimalDenom === this.nBTCMinimalDenom
        );

      if (!nomicBtc) {
        throw new Error("Nomic Bitcoin asset not found in asset list.");
      }

      return pendingDeposits.map((deposit) => ({
        transactionId: deposit.txid,
        amount: deposit.amount,
        confirmations: deposit.confirmations,
        networkFee: {
          address: nomicBtc.coinMinimalDenom,
          amount: ((deposit.minerFeeRate ?? 0) * 1e8).toString(),
          decimals: 8,
          // TODO: Handle case when we can receive allBTC
          denom: nomicBtc.symbol,
          coinGeckoId: nomicBtc.coingeckoId,
        },
        providerFee: {
          address: nomicBtc.coinMinimalDenom,
          amount: ((deposit.bridgeFeeRate ?? 0) * deposit.amount).toString(),
          decimals: 8,
          // TODO: Handle case when we can receive allBTC
          denom: nomicBtc.symbol,
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
