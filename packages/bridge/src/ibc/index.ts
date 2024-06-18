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
    this.validate(params);

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
    const toAmount =
      gasFee.isNeededForTx &&
      gasFee.denom.toLowerCase() === params.fromAsset.address.toLowerCase()
        ? new Int(params.fromAmount).sub(new Int(gasFee.amount)).toString()
        : params.fromAmount;

    if (new Int(toAmount).lte(new Int(0))) {
      throw new BridgeQuoteError([
        {
          errorType: BridgeError.InsufficientAmount,
          message: "Insufficient amount for fees",
        },
      ]);
    }

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
   *
   * @throws `BridgeQuoteError` if an asset doesn't support IBC transfer.
   */
  async getTransactionData(
    params: GetBridgeQuoteParams
  ): Promise<CosmosBridgeTransactionRequest> {
    this.validate(params);

    const { sourceChannel, sourcePort, sourceDenom } =
      this.getIbcSource(params);

    const timeoutHeight = await this.ctx.getTimeoutHeight({
      destinationAddress: params.toAddress,
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
        denom: sourceDenom,
      },
    });

    return {
      type: "cosmos",
      msgTypeUrl: typeUrl,
      msg,
    };
  }

  /**
   * Gets IBC channel and port info from asset list
   *
   * @throws `BridgeQuoteError` if asset not found in asset list or transfer method not found.
   */
  protected getIbcSource({ fromAsset, toAsset }: GetBridgeQuoteParams): {
    sourceChannel: string;
    sourcePort: string;
    sourceDenom: string;
  } {
    const transferAsset = this.ctx.assetLists
      .flatMap((list) => list.assets)
      .find(
        (asset) =>
          asset.coinMinimalDenom === toAsset.sourceDenom ||
          asset.sourceDenom === toAsset.sourceDenom ||
          asset.coinMinimalDenom === fromAsset.sourceDenom ||
          asset.sourceDenom === fromAsset.sourceDenom
      );

    if (!transferAsset)
      throw new BridgeQuoteError([
        {
          errorType: BridgeError.UnsupportedQuoteError,
          message: "IBC asset not found in asset list",
        },
      ]);

    const transferMethod = transferAsset.transferMethods.find(
      ({ type }) => type === "ibc"
    ) as IbcTransferMethod;

    if (!transferMethod)
      throw new BridgeQuoteError([
        {
          errorType: BridgeError.UnsupportedQuoteError,
          message: "IBC transfer method not found",
        },
      ]);

    if (fromAsset.address === transferMethod.counterparty.sourceDenom) {
      // transfer from counterparty
      const { channelId, port, sourceDenom } = transferMethod.counterparty;
      return {
        sourceChannel: channelId,
        sourcePort: port,
        sourceDenom,
      };
    } else {
      // transfer from source
      const { channelId, port } = transferMethod.chain;
      return {
        sourceChannel: channelId,
        sourcePort: port,
        sourceDenom: fromAsset.address,
      };
    }
  }

  /** @throws `BridgeQuoteError` if any errors found in params. */
  protected validate(params: GetBridgeQuoteParams) {
    if (
      params.fromAsset.address.startsWith("cw20") ||
      params.toAsset.address.startsWith("cw20")
    ) {
      throw new BridgeQuoteError([
        {
          errorType: BridgeError.UnsupportedQuoteError,
          message: "IBC Bridge doesn't support cw20 standard",
        },
      ]);
    }

    if (
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
  }
}
