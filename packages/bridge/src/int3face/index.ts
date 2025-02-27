import type { Registry } from "@cosmjs/proto-signing";
import { IbcTransferMethod } from "@osmosis-labs/types";
import {
  deriveCosmosAddress,
  getInt3DOGEMinimalDenom,
} from "@osmosis-labs/utils";

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
import { Int3faceProviderId } from "./utils";

export class Int3faceBridgeProvider implements BridgeProvider {
  static readonly ID = Int3faceProviderId;
  readonly providerName = Int3faceBridgeProvider.ID;
  readonly int3DOGEMinimalDenom: string;
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
  }

  async getQuote(params: GetBridgeQuoteParams): Promise<BridgeQuote> {
    const { fromAddress, toChain, toAddress } = params;

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

    const int3faceBridgeAsset: BridgeAsset = {
      address: int3Doge.coinMinimalDenom,
      decimals: int3Doge.decimals,
      denom: int3Doge.symbol,
      coinGeckoId: int3Doge.coingeckoId,
    };
    const ibcProvider = new IbcBridgeProvider(this.ctx);

    const transactionDataParams: GetBridgeQuoteParams = {
      ...params,
      fromAmount: params.fromAmount,
      fromAsset: int3faceBridgeAsset,
      toChain: {
        chainId: int3faceChain.chain_id,
        chainType: "cosmos",
        chainName: int3faceChain.pretty_name,
      },
      toAsset: int3faceBridgeAsset,
      toAddress: deriveCosmosAddress({
        address: fromAddress,
        desiredBech32Prefix: "int3",
      }),
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

    return {
      input: {
        amount: params.fromAmount,
        ...params.fromAsset,
      },
      expectedOutput: {
        amount: params.fromAmount,
        ...int3faceBridgeAsset,
        denom: "DOGE",
        priceImpact: "0",
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
      transactionRequest: {
        type: "cosmos",
        msgs: ibcTxMessages,
        gasFee: {
          gas: "300000",
          amount: "1000",
          denom: "uosmo",
        },
      },
    };
  }

  async getExternalUrl({
    fromChain,
    toChain,
    fromAsset,
  }: GetBridgeExternalUrlParams): Promise<BridgeExternalUrl | undefined> {
    if (fromChain?.chainType !== "cosmos" || toChain?.chainType !== "doge") {
      return undefined;
    }

    const url = new URL(
      this.ctx.env === "mainnet"
        ? "https://int3face.zone/bridge/"
        : "https://testnet.app.int3face.zone/bridge/"
    );
    // Note: currently supports only osmosis -> dogecoin
    if (fromChain) {
      // url.searchParams.set("fromChain", fromChain.chainName as string);
      url.searchParams.set("fromChain", "osmosis");
    }
    if (fromAsset) {
      // url.searchParams.set("fromToken", fromAsset.denom);
      url.searchParams.set("fromToken", "DOGE.int3");
    }
    if (toChain) {
      // url.searchParams.set("toChain", toChain.chainId);
      url.searchParams.set("toChain", "dogecoin");
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
    if (direction === "deposit") {
      return [];
    }

    const assetListAsset = this.ctx.assetLists
      .flatMap(({ assets }) => assets)
      .find(
        (a) => a.coinMinimalDenom.toLowerCase() === asset.address.toLowerCase()
      );

    if (assetListAsset) {
      const isInt3Doge =
        assetListAsset.coinMinimalDenom.toLowerCase() ===
        this.int3DOGEMinimalDenom.toLowerCase();

      if (isInt3Doge) {
        return [
          {
            transferTypes: ["quote"],
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
}
