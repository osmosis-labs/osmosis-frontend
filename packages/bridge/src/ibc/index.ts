import { Registry } from "@cosmjs/proto-signing";
import { Int } from "@keplr-wallet/unit";
import { ibcProtoRegistry } from "@osmosis-labs/proto-codecs";
import { estimateGasFee } from "@osmosis-labs/tx";
import { IbcTransferMethod } from "@osmosis-labs/types";

import { BridgeError, BridgeQuoteError } from "../errors";
import {
  BridgeProvider,
  BridgeProviderContext,
  BridgeQuote,
  CosmosBridgeTransactionRequest,
  GetBridgeQuoteParams,
} from "../interface";
import { cosmosMsgOpts } from "../msg";

export class IbcBridgeProvider implements BridgeProvider {
  static readonly ID = "IBC";
  readonly providerName = IbcBridgeProvider.ID;

  protected protoRegistry = new Registry(ibcProtoRegistry);

  constructor(protected readonly ctx: BridgeProviderContext) {}

  async getQuote(params: GetBridgeQuoteParams): Promise<BridgeQuote> {
    const fromChainId = params.fromChain.chainId;

    if (
      typeof fromChainId !== "string" ||
      params.fromChain.chainType !== "cosmos" ||
      params.toChain.chainType !== "cosmos"
    ) {
      throw new BridgeQuoteError([
        {
          errorType: BridgeError.UnsupportedQuoteError,
          message: "IBC Bridge only supports cosmos chains",
        },
      ]);
    }

    const signDoc = await this.getTransactionData(params);

    const txSimulation = await estimateGasFee({
      chainId: fromChainId,
      chainList: this.ctx.chainList,
      body: {
        messages: [
          this.protoRegistry.encodeAsAny({
            typeUrl: signDoc.msgTypeUrl,
            value: signDoc.msg,
          }),
        ],
      },
      bech32Address: params.fromAddress,
    });
    const gasFee = txSimulation.amount[0];

    const gasAsset = this.ctx.assetLists
      .flatMap((list) => list.assets)
      .find((asset) => asset.coinMinimalDenom === gasFee.denom);

    /** If the sent tokens are needed for fees, account for that in expected output. */
    const toAmount = gasFee.isSpent
      ? new Int(params.fromAmount).sub(new Int(gasFee.amount)).toString()
      : params.fromAmount;

    return {
      input: {
        amount: params.fromAmount,
        ...params.fromAsset,
      },
      expectedOutput: {
        amount: toAmount,
        ...params.toAsset,
        priceImpact: "0",
      },
      fromChain: params.fromChain,
      toChain: params.toChain,
      // currently subsidized by relayers, but could be paid by user in future by charging the user the gas cost of
      transferFee: {
        ...params.fromAsset,
        amount: "0",
      },
      estimatedTime: 6,
      estimatedGasFee: {
        amount: gasFee.amount,
        denom: gasFee.denom,
        // should be same as denom since it's on the same chain
        sourceDenom: gasFee.denom,
        decimals: gasAsset?.decimals ?? 6,
      },
      transactionRequest: signDoc,
    };
  }

  /**
   * Gets cosmos tx for for signing.
   */
  async getTransactionData(
    params: GetBridgeQuoteParams
  ): Promise<CosmosBridgeTransactionRequest> {
    const { fromAsset } = this.getIbcAssets(params);

    const timeoutHeight = await this.ctx.getTimeoutHeight({
      destinationAddress: params.toAddress,
    });

    const { typeUrl, value: msg } = cosmosMsgOpts.ibcTransfer.messageComposer({
      receiver: params.toAddress,
      sender: params.fromAddress,
      sourceChannel: fromAsset.chain.channelId,
      sourcePort: fromAsset.chain.port,
      timeoutTimestamp: "0" as any,
      // @ts-ignore
      timeoutHeight,
      token: {
        amount: params.fromAmount,
        denom: fromAsset.address,
      },
    });

    return {
      type: "cosmos",
      msgTypeUrl: typeUrl,
      msg,
    };
  }

  /**
   * Gets to/from assets from quote params and appends asset & IBC info from asset list.
   *
   *  @throws `BridgeQuoteError` if an asset doesn't support IBC transfer.
   */
  getIbcAssets(params: GetBridgeQuoteParams) {
    const fromAsset = this.ctx.assetLists
      .flatMap((list) => list.assets)
      .find((asset) => asset.coinMinimalDenom === params.fromAsset.sourceDenom);
    const toAsset = this.ctx.assetLists
      .flatMap((list) => list.assets)
      .find((asset) => asset.coinMinimalDenom === params.fromAsset.sourceDenom);

    if (
      fromAsset?.coinMinimalDenom.startsWith("cw20") ||
      toAsset?.coinMinimalDenom.startsWith("cw20")
    ) {
      throw new BridgeQuoteError([
        {
          errorType: BridgeError.UnsupportedQuoteError,
          message: "IBC Bridge doesn't support cw20 standard",
        },
      ]);
    }

    const fromIbcInfo = fromAsset?.transferMethods.find(
      ({ type }) => type === "ibc"
    ) as IbcTransferMethod;
    const toIbcInfo = toAsset?.transferMethods.find(
      ({ type }) => type === "ibc"
    ) as IbcTransferMethod;

    if (!fromIbcInfo || !toIbcInfo) {
      throw new BridgeQuoteError([
        {
          errorType: BridgeError.UnsupportedQuoteError,
          message: "IBC Bridge doesn't support give assets",
        },
      ]);
    }

    return {
      fromAsset: { ...params.fromAsset, ...fromAsset, ...fromIbcInfo },
      toAsset: { ...params.toAsset, ...toAsset, ...toIbcInfo },
    };
  }
}
