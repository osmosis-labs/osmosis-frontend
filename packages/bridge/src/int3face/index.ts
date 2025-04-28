import type { Registry } from "@cosmjs/proto-signing";
import { getRouteTokenOutGivenIn } from "@osmosis-labs/server";
import { estimateGasFee, getSwapMessages } from "@osmosis-labs/tx";
import { IbcTransferMethod } from "@osmosis-labs/types";
import { Dec } from "@osmosis-labs/unit";
import { getInt3DOGEMinimalDenom } from "@osmosis-labs/utils";

import { BridgeQuoteError } from "../errors";
import { IbcBridgeProvider } from "../ibc";
import {
  BridgeAsset,
  BridgeChain,
  BridgeExternalUrl,
  BridgeProvider,
  BridgeProviderContext,
  BridgeQuote,
  BridgeSupportedAsset,
  BridgeTransactionRequest,
  GetBridgeExternalUrlParams,
  GetBridgeQuoteParams,
  GetBridgeSupportedAssetsParams,
} from "../interface";
import { getGasAsset } from "../utils/gas";
import { Int3faceProviderId } from "./utils";

export class Int3faceBridgeProvider implements BridgeProvider {
  static readonly ID = Int3faceProviderId;
  readonly providerName = Int3faceBridgeProvider.ID;
  readonly int3DOGEMinimalDenom: string;
  readonly allDogeMinimalDenom: string | undefined;
  protected protoRegistry: Registry | null = null;

  protected readonly observerApiURL: string;

  constructor(protected readonly ctx: BridgeProviderContext) {
    this.observerApiURL =
      ctx.env === "mainnet"
        ? "https://observer.mainnet.int3face.zone/v1"
        : "https://observer.testnet.int3face.zone/v1";

    this.int3DOGEMinimalDenom = getInt3DOGEMinimalDenom({
      env: this.ctx.env,
    });

    // Define allDogeMinimalDenom inline
    this.allDogeMinimalDenom =
      ctx.env === "mainnet"
        ? "factory/osmo10pk4crey8fpdyqd62rsau0y02e3rk055w5u005ah6ly7k849k5tsf72x40/alloyed/allDOGE"
        : undefined; // No testnet allDOGE for now
  }

  async getQuote(params: GetBridgeQuoteParams): Promise<BridgeQuote> {
    const { fromAddress, toChain, toAddress, fromAsset, fromAmount } = params;

    if (toChain.chainId !== "dogecoin") {
      throw new BridgeQuoteError({
        bridgeId: Int3faceProviderId,
        errorType: "UnsupportedQuoteError",
        message: "Only Dogecoin is supported as a destination chain.",
      });
    }

    const destMemo = `{"dest-address": "${toAddress}", "dest-chain-id": "dogecoin"}`;

    const int3Doge = this.ctx.assetLists
      .flatMap(({ assets }) => assets)
      .find(
        ({ coinMinimalDenom }) => coinMinimalDenom === this.int3DOGEMinimalDenom
      );

    if (!int3Doge) {
      throw new BridgeQuoteError({
        bridgeId: Int3faceProviderId,
        errorType: "UnsupportedQuoteError",
        message: "Int3face Dogecoin asset not found in asset list.",
      });
    }

    const transferMethod = int3Doge.transferMethods.find(
      (method): method is IbcTransferMethod => method.type === "ibc"
    );

    if (!transferMethod) {
      throw new BridgeQuoteError({
        bridgeId: Int3faceProviderId,
        errorType: "UnsupportedQuoteError",
        message: "IBC transfer method not found for Int3face Dogecoin asset.",
      });
    }

    const int3faceChain = this.ctx.chainList.find(
      ({ chain_name }) => chain_name === transferMethod.counterparty.chainName
    );

    if (!int3faceChain) {
      throw new BridgeQuoteError({
        bridgeId: Int3faceProviderId,
        errorType: "UnsupportedQuoteError",
        message: "Int3face chain not found in chain list.",
      });
    }

    let swapMessages: Awaited<ReturnType<typeof getSwapMessages>>;
    let swapRoute:
      | Awaited<ReturnType<typeof getRouteTokenOutGivenIn>>
      | undefined;

    if (
      this.allDogeMinimalDenom &&
      fromAsset.address.toLowerCase() === this.allDogeMinimalDenom.toLowerCase()
    ) {
      swapRoute = await getRouteTokenOutGivenIn({
        assetLists: this.ctx.assetLists,
        tokenInAmount: fromAmount,
        tokenInDenom: fromAsset.address,
        tokenOutDenom: this.int3DOGEMinimalDenom,
      });

      swapMessages = await getSwapMessages({
        coinAmount: fromAmount,
        maxSlippage: params.slippage?.toString() ?? "0.005",
        quote: swapRoute,
        tokenInCoinDecimals: fromAsset.decimals,
        tokenInCoinMinimalDenom: fromAsset.address,
        tokenOutCoinDecimals: int3Doge.decimals,
        tokenOutCoinMinimalDenom: int3Doge.coinMinimalDenom,
        userOsmoAddress: fromAddress,
        quoteType: "out-given-in",
      });
    } else {
      swapMessages = [];
      swapRoute = undefined;
    }

    if (!swapMessages) {
      throw new BridgeQuoteError({
        bridgeId: Int3faceProviderId,
        errorType: "CreateCosmosTxError",
        message: "Failed to get swap messages.",
      });
    }

    const int3faceBridgeAsset: BridgeAsset = {
      address: int3Doge.coinMinimalDenom,
      decimals: int3Doge.decimals,
      denom: int3Doge.symbol,
      coinGeckoId: int3Doge.coingeckoId,
    };
    const ibcProvider = new IbcBridgeProvider(this.ctx);

    const transactionDataParams: GetBridgeQuoteParams = {
      ...params,
      fromAmount: !!swapRoute
        ? swapRoute.amount.toCoin().amount
        : params.fromAmount,
      fromAsset: int3faceBridgeAsset,
      toChain: {
        chainId: int3faceChain.chain_id,
        chainType: "cosmos",
        chainName: int3faceChain.pretty_name,
      },
      toAsset: int3faceBridgeAsset,
      /** x/bridge module address on the Int3face chain, all the IBC transfers have to be handled using this address */
      toAddress: "int31zlefkpe3g0vvm9a4h0jf9000lmqutlh99h7fsd",
    };

    const [ibcTxMessages, ibcEstimatedTimeSeconds] = await Promise.all([
      ibcProvider.getTxMessages({
        ...transactionDataParams,
        memo: destMemo,
      }),
      ibcProvider.estimateTransferTime(
        transactionDataParams.fromChain.chainId.toString(),
        transactionDataParams.toChain.chainId.toString()
      ),
    ]);

    // 10 minutes
    const int3faceEstimatedTimeSeconds = 10 * 60;

    const msgs = [...swapMessages, ...ibcTxMessages];

    // Estimated Gas
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
          bridgeId: Int3faceProviderId,
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
        ).toString(),
        ...int3faceBridgeAsset,
        denom: "DOGE",
        priceImpact: swapRoute?.priceImpactTokenOut?.toDec().toString() ?? "0",
      },
      fromChain: params.fromChain,
      toChain: params.toChain,
      transferFee: {
        ...params.fromAsset,
        denom: "DOGE",
        chainId: params.fromChain.chainId,
        amount: "0",
      },
      estimatedTime: ibcEstimatedTimeSeconds + int3faceEstimatedTimeSeconds,
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

  async getExternalUrl({
    fromChain,
    toChain,
  }: GetBridgeExternalUrlParams): Promise<BridgeExternalUrl | undefined> {
    // Check for valid chain combinations: either osmosis->dogecoin or dogecoin->osmosis
    const isOsmosisToDoge =
      fromChain?.chainType === "cosmos" &&
      fromChain.chainId === "osmosis" &&
      toChain?.chainId === "dogecoin";

    const isDogeToOsmosis =
      fromChain?.chainId === "dogecoin" &&
      toChain?.chainType === "cosmos" &&
      toChain.chainId === "osmosis";

    if (!isOsmosisToDoge && !isDogeToOsmosis) {
      return undefined;
    }

    const url = new URL(
      this.ctx.env === "mainnet"
        ? "https://int3face.zone/bridge/"
        : "https://testnet.app.int3face.zone/bridge/"
    );

    if (isOsmosisToDoge) {
      url.searchParams.set("fromChain", "osmosis");
      url.searchParams.set("fromToken", "DOGE.int3");
      url.searchParams.set("toChain", "dogecoin");
    } else {
      url.searchParams.set("fromChain", "dogecoin");
      url.searchParams.set("toChain", "osmosis");
      url.searchParams.set("toToken", "DOGE.int3");
    }

    return { urlProviderName: "Int3face", url };
  }

  async getTransactionData(): Promise<BridgeTransactionRequest> {
    throw new Error("Int3face transactions are currently not supported.");
  }

  // Note: keep for future
  // getVaultAddresses() {
  //
  //   return cachified({
  //     cache: this.ctx.cache,
  //     key: Int3faceBridgeProvider.ID + "_vault",
  //     ttl: this.ctx.env === "mainnet" ? 30 * 60 * 1000 : -1, // 30 minutes for mainnet
  //     getFreshValue: async () => {
  //       try {
  //         const data = await apiClient<Int3FaceVaultResponse>(
  //           `${this.observerApiURL}/vault_addresses`
  //         );
  //         return data.vault_addresses;
  //       } catch (e) {
  //         const error = e as ApiClientError;
  //         throw error.data;
  //       }
  //     },
  //   });
  // }

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
      const isInt3Doge =
        assetListAsset.coinMinimalDenom.toLowerCase() ===
        this.int3DOGEMinimalDenom.toLowerCase();

      const isAllDoge =
        this.allDogeMinimalDenom &&
        assetListAsset.coinMinimalDenom.toLowerCase() ===
          this.allDogeMinimalDenom.toLowerCase();

      if (isInt3Doge || isAllDoge) {
        return [
          {
            transferTypes:
              direction === "deposit" ? ["external-url"] : ["quote"],
            chainId: "dogecoin",
            chainName: "Dogecoin",
            chainType: "doge",
            denom: "DOGE",
            address: "koinu",
            decimals: 8,
          },
        ];
      }
    }

    return [];
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
