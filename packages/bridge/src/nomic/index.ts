import { Dec, RatePretty } from "@keplr-wallet/unit";
import { IbcTransferMethod } from "@osmosis-labs/types";
import { isCosmosAddressValid } from "@osmosis-labs/utils";
import { generateDepositAddressIbc } from "nomic-bitcoin";

import {
  BridgeAsset,
  BridgeChain,
  BridgeDepositAddress,
  BridgeExternalUrl,
  BridgeProvider,
  BridgeProviderContext,
  BridgeQuote,
  BridgeTransactionRequest,
  GetBridgeExternalUrlParams,
  GetBridgeSupportedAssetsParams,
  GetDepositAddressParams,
} from "../interface";

export class NomicBridgeProvider implements BridgeProvider {
  static readonly ID = "Nomic";
  readonly providerName = NomicBridgeProvider.ID;

  constructor(protected readonly ctx: BridgeProviderContext) {}

  async getDepositAddress({
    fromChain,
    toAddress,
  }: GetDepositAddressParams): Promise<BridgeDepositAddress> {
    if (!isCosmosAddressValid({ address: toAddress, bech32Prefix: "osmo" })) {
      throw new Error("Invalid Cosmos address");
    }

    const nomicBtc = this.ctx.assetLists
      .flatMap(({ assets }) => assets)
      .find(
        ({ coinMinimalDenom }) =>
          this.ctx.env === "mainnet"
            ? coinMinimalDenom ===
              "ibc/75345531D87BD90BF108BE7240BD721CB2CB0A1F16D4EBA71B09EC3C43E15C8F" // nBTC
            : coinMinimalDenom ===
              "ibc/DC0EB16363A369425F3E77AD52BAD3CF76AE966D27506058959515867B5B267D" // Testnet nBTC
      );

    if (!nomicBtc) {
      throw new Error("Nomic Bitcoin asset not found in asset list.");
    }

    const transferMethod = nomicBtc.transferMethods.find(
      (method): method is IbcTransferMethod => method.type === "ibc"
    );

    if (!transferMethod) {
      throw new Error("IBC transfer method not found for Nomic Bitcoin asset.");
    }

    if (fromChain.chainId !== "bitcoin") {
      throw new Error("Only Bitcoin is supported as a source chain.");
    }

    const depositInfo = await generateDepositAddressIbc({
      relayers:
        this.ctx.env === "testnet"
          ? ["https://testnet-relayer.nomic.io:8443"]
          : ["https://relayer.nomic.mappum.io:8443"],
      channel: transferMethod.counterparty.channelId, // IBC channel ID on Nomic
      bitcoinNetwork: this.ctx.env === "testnet" ? "testnet" : "bitcoin",
      receiver: toAddress,
    });

    if (depositInfo.code === 1) {
      throw new Error(
        "Failed to generate deposit address. Cause: " + depositInfo.reason
      );
    }

    if (depositInfo.code === 2) {
      throw new Error("Failed to generate deposit address. Bridge at capacity");
    }

    if (depositInfo.code !== 0) {
      throw new Error(
        "Failed to generate deposit address. Unknown error code: " +
          // @ts-expect-error
          depositInfo.code
      );
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
      estimatedTime: "transfer.nomic.confirmations",
    };
  }

  async getQuote(): Promise<BridgeQuote> {
    throw new Error("Nomic quotes are currently not supported.");
  }

  async getSupportedAssets({
    asset,
  }: GetBridgeSupportedAssetsParams): Promise<(BridgeChain & BridgeAsset)[]> {
    // just supports BTC from Bitcoin

    const assetListAsset = this.ctx.assetLists
      .flatMap(({ assets }) => assets)
      .find(
        (a) => a.coinMinimalDenom.toLowerCase() === asset.address.toLowerCase()
      );

    if (assetListAsset) {
      const bitcoinCounterparty = assetListAsset.counterparty.some(
        (c) => c.chainName === "bitcoin"
      );

      if (bitcoinCounterparty) {
        return [
          {
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
}
