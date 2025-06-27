import type { Registry } from "@cosmjs/proto-signing";
import { getRouteTokenOutGivenIn } from "@osmosis-labs/server";
import { estimateGasFee, getSwapMessages } from "@osmosis-labs/tx";
import { IbcTransferMethod } from "@osmosis-labs/types";
import { Dec } from "@osmosis-labs/unit";

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
import { getGasAsset } from "../utils";
import { checkCanTransfer } from "./queries";
import {
  getInt3faceBridgeConfig,
  Int3faceSupportedToken,
  Int3faceSupportedTokensConfig,
} from "./types";
import { Int3faceProviderId } from "./utils";

export class Int3faceBridgeProvider implements BridgeProvider {
  static readonly ID = Int3faceProviderId;
  readonly providerName = Int3faceBridgeProvider.ID;
  protected protoRegistry: Registry | null = null;
  protected readonly observerApiURL: string;

  private readonly tokenConfigs: Int3faceSupportedTokensConfig;

  constructor(protected readonly ctx: BridgeProviderContext) {
    this.observerApiURL =
      ctx.env === "mainnet"
        ? "https://observer.mainnet.int3face.zone/v1"
        : "https://observer.testnet.int3face.zone/v1";

    this.tokenConfigs = getInt3faceBridgeConfig(ctx.env);
  }

  private getInt3TokenInfo(denom?: string): Int3faceSupportedToken | null {
    if (!denom) {
      return null;
    }

    const config = this.tokenConfigs[denom];
    if (!config) {
      throw new BridgeQuoteError({
        bridgeId: Int3faceProviderId,
        errorType: "UnsupportedQuoteError",
        message: `Token ${denom} is not supported.`,
      });
    }
    return config;
  }

  async getQuote(params: GetBridgeQuoteParams): Promise<BridgeQuote> {
    const {
      fromAddress,
      fromChain,
      toChain,
      toAddress,
      fromAsset,
      fromAmount,
    } = params;
    const tokenConfig = this.getInt3TokenInfo(fromAsset.denom);
    if (!tokenConfig) {
      throw new BridgeQuoteError({
        bridgeId: Int3faceProviderId,
        errorType: "UnsupportedQuoteError",
        message: `Int3face ${toChain.chainId} chain not found in chain list.`,
      });
    }

    // Check if transfer is available on Int3face side
    const canTransfer = await checkCanTransfer(
      fromChain.chainId,
      toChain.chainId,
      fromAsset.denom,
      this.ctx.env
    );

    if (!canTransfer?.can_transfer) {
      throw new BridgeQuoteError({
        bridgeId: Int3faceProviderId,
        errorType: "UnsupportedQuoteError",
        message:
          canTransfer?.reason || "Transfer is not available at this time",
      });
    }

    const destMemo = `{"dest-address": "${toAddress}", "dest-chain-id": "${toChain.chainId}"}`;

    const int3Asset = this.ctx.assetLists
      .flatMap(({ assets }) => assets)
      .find(
        ({ coinMinimalDenom }) =>
          coinMinimalDenom === tokenConfig.int3MinimalDenom
      );

    if (!int3Asset) {
      throw new BridgeQuoteError({
        bridgeId: Int3faceProviderId,
        errorType: "UnsupportedQuoteError",
        message: `Int3face ${toChain.chainId} asset not found in asset list.`,
      });
    }

    const transferMethod = int3Asset.transferMethods.find(
      (method): method is IbcTransferMethod => method.type === "ibc"
    );

    if (!transferMethod) {
      throw new BridgeQuoteError({
        bridgeId: Int3faceProviderId,
        errorType: "UnsupportedQuoteError",
        message: "IBC transfer method not found for Int3face asset.",
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
      tokenConfig?.allTokenMinimalDenom &&
      fromAsset.address.toLowerCase() ===
        tokenConfig.allTokenMinimalDenom.toLowerCase()
    ) {
      swapRoute = await getRouteTokenOutGivenIn({
        assetLists: this.ctx.assetLists,
        tokenInAmount: fromAmount,
        tokenInDenom: fromAsset.address,
        tokenOutDenom: tokenConfig.int3MinimalDenom,
      });

      swapMessages = await getSwapMessages({
        coinAmount: fromAmount,
        maxSlippage: params.slippage?.toString() ?? "0.005",
        quote: swapRoute,
        tokenInCoinDecimals: fromAsset.decimals,
        tokenInCoinMinimalDenom: fromAsset.address,
        tokenOutCoinDecimals: int3Asset.decimals,
        tokenOutCoinMinimalDenom: int3Asset.coinMinimalDenom,
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
      address: int3Asset.coinMinimalDenom,
      decimals: int3Asset.decimals,
      denom: int3Asset.symbol,
      coinGeckoId: int3Asset.coingeckoId,
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
        denom: tokenConfig.denom,
        priceImpact: swapRoute?.priceImpactTokenOut?.toDec().toString() ?? "0",
      },
      fromChain: params.fromChain,
      toChain: params.toChain,
      transferFee: {
        ...params.fromAsset,
        denom: tokenConfig.denom,
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
    fromAsset,
    toAsset,
    fromChain,
    toChain,
  }: GetBridgeExternalUrlParams): Promise<BridgeExternalUrl | undefined> {
    const tokenConfigOfFromChain = this.getInt3TokenInfo(fromAsset?.denom);
    const tokenConfigOfToChain = this.getInt3TokenInfo(toAsset?.denom);

    // Check for valid chain combinations
    const isOsmosisToSupportedChain =
      fromChain?.chainType === "cosmos" &&
      fromChain.chainId === "osmosis" &&
      !!tokenConfigOfToChain;

    const isSupportedChainToOsmosis =
      toChain?.chainType === "cosmos" &&
      toChain.chainId === "osmosis" &&
      !!tokenConfigOfFromChain;

    if (!isOsmosisToSupportedChain && !isSupportedChainToOsmosis) {
      return undefined;
    }

    const url = new URL(
      this.ctx.env === "mainnet"
        ? "https://int3face.zone/bridge/"
        : "https://testnet.app.int3face.zone/bridge/"
    );

    if (isOsmosisToSupportedChain) {
      url.searchParams.set("fromChain", "osmosis");
      url.searchParams.set("toChain", String(toChain?.chainId));
      url.searchParams.set("fromToken", tokenConfigOfToChain?.int3TokenSymbol);
    } else {
      url.searchParams.set("fromChain", String(fromChain?.chainId));
      url.searchParams.set("toChain", "osmosis");
      url.searchParams.set("fromToken", String(tokenConfigOfFromChain?.denom));
    }

    return { urlProviderName: "Int3face", url };
  }

  async getTransactionData(): Promise<BridgeTransactionRequest> {
    throw new Error("Int3face transactions are currently not supported.");
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

    const tokenConfig = this.getInt3TokenInfo(assetListAsset?.symbol);

    if (!tokenConfig) {
      return [];
    }

    if (assetListAsset) {
      const isInt3Asset =
        assetListAsset.coinMinimalDenom.toLowerCase() ===
        tokenConfig.int3MinimalDenom.toLowerCase();

      const isAllAsset =
        tokenConfig.allTokenMinimalDenom &&
        assetListAsset.coinMinimalDenom.toLowerCase() ===
          tokenConfig.allTokenMinimalDenom.toLowerCase();

      if (isInt3Asset || isAllAsset) {
        return [
          {
            transferTypes:
              direction === "deposit" ? ["external-url"] : ["quote"],
            chainId: tokenConfig.chainId,
            chainName: tokenConfig.chainName,
            chainType: tokenConfig.chainType,
            denom: tokenConfig.denom,
            address: tokenConfig.address,
            decimals: assetListAsset.decimals,
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
