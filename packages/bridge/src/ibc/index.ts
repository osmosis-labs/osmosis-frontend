import { Registry } from "@cosmjs/proto-signing";
import { ibcProtoRegistry } from "@osmosis-labs/proto-codecs";
import {
  Chain,
  queryGeneratedChains,
  queryRPCStatus,
} from "@osmosis-labs/server";
import {
  calcAverageBlockTimeMs,
  cosmosMsgOpts,
  estimateGasFee,
} from "@osmosis-labs/tx";
import { IbcTransferMethod } from "@osmosis-labs/types";
import cachified from "cachified";

import { BridgeQuoteError } from "../errors";
import {
  BridgeAsset,
  BridgeChain,
  BridgeExternalUrl,
  BridgeProvider,
  BridgeProviderContext,
  BridgeQuote,
  CosmosBridgeTransactionRequest,
  GetBridgeExternalUrlParams,
  GetBridgeQuoteParams,
  GetBridgeSupportedAssetsParams,
} from "../interface";

export class IbcBridgeProvider implements BridgeProvider {
  static readonly ID = "IBC";
  readonly providerName = IbcBridgeProvider.ID;

  protected protoRegistry = new Registry(ibcProtoRegistry);

  constructor(protected readonly ctx: BridgeProviderContext) {}

  async getQuote(params: GetBridgeQuoteParams): Promise<BridgeQuote> {
    this.validate(params);

    const fromChainId = params.fromChain.chainId;
    const toChainId = params.toChain.chainId;

    if (
      typeof fromChainId !== "string" ||
      typeof toChainId !== "string" ||
      params.fromChain.chainType !== "cosmos" ||
      params.toChain.chainType !== "cosmos"
    ) {
      throw new BridgeQuoteError({
        bridgeId: IbcBridgeProvider.ID,
        errorType: "UnsupportedQuoteError",
        message: "IBC Bridge only supports cosmos chains",
      });
    }

    const [signDoc, estimatedTime] = await Promise.all([
      this.getTransactionData(params),
      this.estimateTransferTime(fromChainId, toChainId),
    ]);

    const gasAsset = signDoc.gasAsset;
    const gasFee = signDoc.gasFee;

    return {
      input: {
        amount: params.fromAmount,
        ...params.fromAsset,
      },
      expectedOutput: {
        amount: params.fromAmount,
        ...params.toAsset,
        priceImpact: "0",
      },
      fromChain: params.fromChain,
      toChain: params.toChain,
      // currently subsidized by relayers, but could be paid by user in future by charging the user the gas cost of
      transferFee: {
        ...params.fromAsset,
        chainId: fromChainId,
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
      transactionRequest: signDoc,
    };
  }

  async getSupportedAssets({
    asset,
  }: GetBridgeSupportedAssetsParams): Promise<(BridgeChain & BridgeAsset)[]> {
    try {
      const assetListAsset = this.ctx.assetLists
        .flatMap((list) => list.assets)
        .find((a) => a.coinMinimalDenom === asset.address);

      const ibcTransferMethod = assetListAsset?.transferMethods.find(
        ({ type }) => type === "ibc"
      ) as IbcTransferMethod;

      if (!ibcTransferMethod || !assetListAsset)
        throw new Error(
          "IBC transfer method or asset not found for: " + asset.address
        );

      return [
        {
          chainId: ibcTransferMethod.counterparty.chainId,
          chainType: "cosmos",
          address: assetListAsset.sourceDenom,
          denom: assetListAsset.symbol,
          decimals: assetListAsset.decimals,
        },
      ];
    } catch (e) {
      // Avoid returning options if there's an unexpected error, such as the provider being down
      if (process.env.NODE_ENV !== "production") {
        console.error(
          IbcBridgeProvider.ID,
          "failed to get supported assets:",
          e
        );
      }
      return [];
    }
  }

  /**
   * Gets cosmos tx for for signing.
   *
   * @throws `BridgeQuoteError` if an asset doesn't support IBC transfer.
   */
  async getTransactionData(
    params: GetBridgeQuoteParams
  ): Promise<CosmosBridgeTransactionRequest & { gasAsset?: BridgeAsset }> {
    this.validate(params);

    const { sourceChannel, sourcePort, address } = this.getIbcSource(params);

    const timeoutHeight = await this.ctx.getTimeoutHeight({
      chainId: params.toChain.chainId.toString(),
    });

    const { typeUrl, value: msg } = cosmosMsgOpts.ibcTransfer.messageComposer({
      receiver: params.toAddress,
      sender: params.fromAddress,
      sourceChannel,
      sourcePort,
      timeoutTimestamp: "0" as any,
      // @ts-ignore
      timeoutHeight,
      token: {
        amount: params.fromAmount,
        denom: address,
      },
    });

    const txSimulation = await estimateGasFee({
      chainId: params.fromChain.chainId as string,
      chainList: this.ctx.chainList,
      body: {
        messages: [
          this.protoRegistry.encodeAsAny({
            typeUrl: typeUrl,
            value: msg,
          }),
        ],
      },
      bech32Address: params.fromAddress,
      fallbackGasLimit: cosmosMsgOpts.ibcTransfer.gas,
    }).catch((e) => {
      if (
        e instanceof Error &&
        e.message.includes(
          "No fee tokens found with sufficient balance on account"
        )
      ) {
        throw new BridgeQuoteError({
          bridgeId: IbcBridgeProvider.ID,
          errorType: "InsufficientAmountError",
          message: e.message,
        });
      }

      throw e;
    });

    const gasFee = txSimulation.amount[0];
    const gasAsset = await this.getGasAsset(
      params.fromChain.chainId as string,
      gasFee.denom
    );

    return {
      type: "cosmos",
      msgTypeUrl: typeUrl,
      msg,
      gasFee: {
        gas: txSimulation.gas,
        amount: gasFee.amount,
        denom: gasFee.denom,
      },
      gasAsset,
    };
  }

  /**
   * Gets gas asset from asset list or chain list, attempting to match the coinMinimalDenom or chainSuggestionDenom.
   * @returns gas bridge asset, or undefined if not found.
   */
  async getGasAsset(
    fromChainId: string,
    denom: string
  ): Promise<BridgeAsset | undefined> {
    // try to get asset list fee asset first, or otherwise the chain fee currency
    const assetListAsset = this.ctx.assetLists
      .flatMap(({ assets }) => assets)
      .find((asset) => asset.coinMinimalDenom);

    if (assetListAsset) {
      return {
        address: assetListAsset.coinMinimalDenom,
        denom: assetListAsset.symbol,
        decimals: assetListAsset.decimals,
        coinGeckoId: assetListAsset.coingeckoId,
      };
    }

    const chains = await this.getChains();
    const chain = chains.find((c) => c.chain_id === fromChainId);
    const feeCurrency = chain?.feeCurrencies.find(
      ({ chainSuggestionDenom }) => chainSuggestionDenom === denom
    );

    if (feeCurrency) {
      return {
        address: feeCurrency.chainSuggestionDenom,
        denom: feeCurrency.coinDenom,
        decimals: feeCurrency.coinDecimals,
        coinGeckoId: feeCurrency.coinGeckoId,
      };
    }
  }

  /**
   * Gets IBC channel and port info from asset list
   *
   * @throws `BridgeQuoteError` if asset not found in asset list or transfer method not found.
   */
  protected getIbcSource({ fromAsset, toAsset }: GetBridgeQuoteParams): {
    sourceChannel: string;
    sourcePort: string;
    address: string;
  } {
    const transferAsset = this.ctx.assetLists
      .flatMap((list) => list.assets)
      .find(
        (asset) =>
          asset.coinMinimalDenom.toLowerCase() ===
            toAsset.address.toLowerCase() ||
          asset.coinMinimalDenom.toLowerCase() ===
            fromAsset.address.toLowerCase()
      );

    if (!transferAsset)
      throw new BridgeQuoteError({
        bridgeId: IbcBridgeProvider.ID,
        errorType: "CreateCosmosTxError",
        message: "IBC asset not found in asset list",
      });

    const transferMethod = transferAsset.transferMethods.find(
      ({ type }) => type === "ibc"
    ) as IbcTransferMethod;

    if (!transferMethod)
      throw new BridgeQuoteError({
        bridgeId: IbcBridgeProvider.ID,
        errorType: "CreateCosmosTxError",
        message: "IBC transfer method not found",
      });

    if (fromAsset.address === transferMethod.counterparty.sourceDenom) {
      // transfer from counterparty
      const { channelId, port, sourceDenom } = transferMethod.counterparty;
      return {
        sourceChannel: channelId,
        sourcePort: port,
        address: sourceDenom,
      };
    } else {
      // transfer from source
      const { channelId, port } = transferMethod.chain;
      return {
        sourceChannel: channelId,
        sourcePort: port,
        address: fromAsset.address,
      };
    }
  }

  /** @throws `BridgeQuoteError` if any errors found in params. */
  protected validate(params: GetBridgeQuoteParams) {
    if (
      params.fromAsset.address.startsWith("cw20") ||
      params.toAsset.address.startsWith("cw20")
    ) {
      throw new BridgeQuoteError({
        bridgeId: IbcBridgeProvider.ID,
        errorType: "UnsupportedQuoteError",
        message: "IBC Bridge doesn't support cw20 standard",
      });
    }

    if (
      params.fromChain.chainType !== "cosmos" ||
      params.toChain.chainType !== "cosmos"
    ) {
      throw new BridgeQuoteError({
        bridgeId: IbcBridgeProvider.ID,
        errorType: "UnsupportedQuoteError",
        message: "IBC Bridge only supports cosmos chains",
      });
    }
  }

  /**
   * Estimates the transfer time for IBC transfers in seconds.
   * Looks at the average block time of the two chains.
   */
  async estimateTransferTime(
    fromChainId: string,
    toChainId: string
  ): Promise<number> {
    const fromChain = this.ctx.chainList.find(
      (c) => c.chain_id === fromChainId
    );
    const toChain = this.ctx.chainList.find((c) => c.chain_id === toChainId);

    const fromRpc = fromChain?.apis.rpc[0]?.address;
    const toRpc = toChain?.apis.rpc[0]?.address;

    if (!fromChain || !toChain || !fromRpc || !toRpc) {
      throw new BridgeQuoteError({
        bridgeId: IbcBridgeProvider.ID,
        errorType: "UnsupportedQuoteError",
        message: "Chain not found",
      });
    }

    const [fromBlockTimeMs, toBlockTimeMs] = await Promise.all([
      queryRPCStatus({ restUrl: fromRpc }).then(calcAverageBlockTimeMs),
      queryRPCStatus({ restUrl: toRpc }).then(calcAverageBlockTimeMs),
    ]);

    // convert to seconds
    return Math.floor(
      // initiating tx
      (fromBlockTimeMs +
        // lockup tx
        toBlockTimeMs +
        // timeout ack tx
        fromBlockTimeMs) /
        1000
    );
  }

  async getExternalUrl({
    fromChain,
    toChain,
    fromAsset,
    toAsset,
  }: GetBridgeExternalUrlParams): Promise<BridgeExternalUrl | undefined> {
    if (fromChain?.chainType === "evm" || toChain?.chainType === "evm") {
      return undefined;
    }

    const url = new URL("https://geo.tfm.com/");
    if (fromChain) {
      url.searchParams.set("chainFrom", fromChain.chainId);
    }
    if (fromAsset) {
      url.searchParams.set("token0", fromAsset.address);
    }
    if (toChain) {
      url.searchParams.set("chainTo", toChain.chainId);
    }
    if (toAsset) {
      url.searchParams.set("token1", toAsset.address);
    }

    return { urlProviderName: "TFM", url };
  }

  getChains(): Promise<Chain[]> {
    return cachified({
      cache: this.ctx.cache,
      key: "queryGeneratedChains" + this.ctx.chainList[0].chain_id,
      ttl: 60 * 60 * 24, // 1 day
      getFreshValue: () =>
        queryGeneratedChains({ zoneChainId: this.ctx.chainList[0].chain_id }),
    });
  }
}

export * from "./transfer-status";
