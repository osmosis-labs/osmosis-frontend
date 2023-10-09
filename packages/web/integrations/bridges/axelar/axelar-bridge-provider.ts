import type { AxelarQueryAPI } from "@axelar-network/axelarjs-sdk";
import { CoinPretty, Dec } from "@keplr-wallet/unit";
import { cachified } from "cachified";

import { ChainInfos } from "~/config";
import { getAssetFromWalletAssets } from "~/config/utils";
import { EthereumChainInfo } from "~/integrations/bridge-info";
import { getTransferStatus } from "~/integrations/bridges/axelar/queries";
import { BridgeQuoteError } from "~/integrations/bridges/errors";
import { querySimplePrice } from "~/queries/coingecko";

import {
  BridgeProvider,
  BridgeProviderContext,
  BridgeQuote,
  BridgeTransferStatus,
  GetBridgeQuoteParams,
} from "../types";

const providerName = "Axelar" as const;
export class AxelarBridgeProvider implements BridgeProvider {
  static providerName = providerName;
  providerName = providerName;
  logoUrl = "/bridges/axelar.svg";

  _queryClient: AxelarQueryAPI | null = null;

  axelarScanBaseUrl: "https://axelarscan.io" | "https://testnet.axelarscan.io";
  axelarApiBaseUrl:
    | "https://testnet.api.axelarscan.io"
    | "https://api.axelarscan.io";

  constructor(readonly ctx: BridgeProviderContext) {
    this.axelarScanBaseUrl =
      this.ctx.env === "mainnet"
        ? "https://axelarscan.io"
        : "https://testnet.axelarscan.io";
    this.axelarApiBaseUrl =
      this.ctx.env === "mainnet"
        ? "https://api.axelarscan.io"
        : "https://testnet.api.axelarscan.io";
  }

  async getQuote({
    fromAmount,
    fromAsset,
    fromChain,
    fromAddress,
    toAddress,
    toAsset,
    toChain,
    slippage = 1,
  }: GetBridgeQuoteParams): Promise<BridgeQuote> {
    return cachified({
      cache: this.ctx.cache,
      key: JSON.stringify({
        id: providerName,
        fromAmount,
        fromAsset,
        fromChain,
        fromAddress,
        toAddress,
        toAsset,
        toChain,
        slippage,
      }),
      getFreshValue: async (): Promise<BridgeQuote> => {
        try {
          const amount = new CoinPretty(
            {
              coinDecimals: fromAsset.decimals,
              coinDenom: fromAsset.denom,
              coinMinimalDenom: fromAsset.minimalDenom ?? fromAsset.denom,
            },
            fromAmount
          ).toCoin().amount;

          const fromChainAxelarId =
            fromChain.chainType === "cosmos"
              ? ChainInfos.find(({ chainId }) => chainId === fromChain.chainId)
                  ?.axelarChainId
              : Object.values(EthereumChainInfo).find(
                  ({ chainId }) => chainId === fromChain.chainId
                )?.chainName;

          const toChainAxelarId =
            toChain.chainType === "cosmos"
              ? ChainInfos.find(({ chainId }) => chainId === toChain.chainId)
                  ?.axelarChainId
              : Object.values(EthereumChainInfo).find(
                  ({ chainId }) => chainId === toChain.chainId
                )?.chainName;

          if (!fromChainAxelarId || !toChainAxelarId) {
            throw new BridgeQuoteError([
              {
                errorType: "Unsupported Quote",
                message: "Axelar Bridge doesn't support this quote",
              },
            ]);
          }

          const queryClient = await this.getQueryClient();
          const transferFeeRes = await queryClient.getTransferFee(
            fromChainAxelarId,
            toChainAxelarId,
            fromAsset.minimalDenom,
            Number(amount)
          );

          if (!transferFeeRes.fee) {
            throw new BridgeQuoteError([
              {
                errorType: "Unsupported Quote",
                message: "Axelar Bridge doesn't support this quote",
              },
            ]);
          }

          const transferFeeAsset = getAssetFromWalletAssets(
            transferFeeRes.fee.denom
          );

          const currency = "usd";
          let transferFeeFiatValue;
          if (
            transferFeeAsset?.coingecko_id &&
            !transferFeeAsset.coingecko_id.startsWith("pool:")
          ) {
            const id = transferFeeAsset.coingecko_id;
            const price = await querySimplePrice([id], [currency]);
            transferFeeFiatValue = price[transferFeeAsset.coingecko_id]["usd"];
          }

          return {
            estimatedTime: this.getWaitTime(fromChainAxelarId),
            fromAmount,
            toAmount: fromAmount,
            toAmountMin: fromAmount,
            transferFee: {
              amount: transferFeeRes.fee.amount,
              denom: transferFeeRes.fee.denom,
              coinMinimalDenom: fromAsset.minimalDenom,
              decimals: fromAsset.decimals,
              ...(transferFeeFiatValue && {
                fiatValue: {
                  currency,
                  amount: new CoinPretty(
                    {
                      coinDecimals: fromAsset.decimals,
                      coinDenom: fromAsset.denom,
                      coinMinimalDenom: fromAsset.minimalDenom,
                    },
                    transferFeeRes.fee.amount
                  )
                    .mul(new Dec(transferFeeFiatValue))
                    .toDec()
                    .toString(),
                },
              }),
            },
            transactionRequest: {} as any, // TODO: Implement transaction
          };
        } catch (e) {
          const error = e as string | BridgeQuoteError | Error;

          if (error instanceof BridgeQuoteError) {
            throw error;
          }

          if (error instanceof Error) {
            throw new BridgeQuoteError([
              {
                errorType: "Unknown Error",
                message: error.message,
              },
            ]);
          }

          let errorType = "Unknown Error";
          if (error.includes("not found")) {
            errorType = "Unsupported Quote";
          }

          throw new BridgeQuoteError([
            {
              errorType,
              message: error,
            },
          ]);
        }
      },
      ttl: 20 * 1000, // 20 seconds,
    });
  }

  async getTransferStatus(params: {
    sendTxHash: string;
  }): Promise<BridgeTransferStatus | undefined> {
    const { sendTxHash } = params;

    const transferStatus = await getTransferStatus(sendTxHash);

    console.log(transferStatus);

    // could be { message: "Internal Server Error" } TODO: display server errors or connection issues to user
    if (
      !Array.isArray(transferStatus) ||
      (Array.isArray(transferStatus) && transferStatus.length === 0)
    ) {
      return;
    }

    try {
      const [data] = transferStatus;
      const idWithoutSourceChain =
        data.type && data.type === "wrap" && data.wrap
          ? data.wrap.tx_hash
          : data?.id.split("_")[0].toLowerCase();

      // insufficient fee
      if (data.send && data.send.insufficient_fee) {
        return {
          id: idWithoutSourceChain,
          status: "failed",
          reason: "insufficientFee",
        };
      }

      if (data.status === "executed") {
        return { id: idWithoutSourceChain, status: "success" };
      }

      if (
        // any of all complete stages does not return success
        data.send &&
        data.link &&
        data.confirm_deposit &&
        data.ibc_send && // transfer is complete
        (data.send.status !== "success" ||
          data.confirm_deposit.status !== "success" ||
          data.ibc_send.status !== "success")
      ) {
        return { id: idWithoutSourceChain, status: "failed" };
      }
    } catch {
      return undefined;
    }
  }

  getWaitTime(sourceChain: string) {
    switch (sourceChain) {
      case "Ethereum":
      case "Polygon":
        return 900;
      default:
        return 180;
    }
  }

  async initClients() {
    try {
      const [queryClientClass, Environment] = await import(
        "@axelar-network/axelarjs-sdk"
      ).then((m) => [m.AxelarQueryAPI, m.Environment] as const);

      this._queryClient = new queryClientClass({
        environment:
          this.ctx.env === "mainnet"
            ? Environment.MAINNET
            : Environment.TESTNET,
      });
    } catch (e) {
      console.error("Failed to init Axelar client. Reason: ", e);
      throw new BridgeQuoteError([
        {
          errorType: "InitClientError",
          message: "Failed to init Axelar client",
        },
      ]);
    }
  }

  async getQueryClient() {
    if (!this._queryClient) {
      try {
        await this.initClients();
      } catch (e) {
        console.error("Failed to init Axelar client. Reason: ", e);
        throw new BridgeQuoteError([
          {
            errorType: "InitClientError",
            message: "Failed to init Axelar query client",
          },
        ]);
      }
    }

    return this._queryClient!;
  }
}
