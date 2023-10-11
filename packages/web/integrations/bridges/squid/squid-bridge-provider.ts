import type {
  GetRoute as SquidGetRouteParams,
  RouteResponse,
  StatusResponse,
} from "@0xsquid/sdk";
import { CoinPretty } from "@keplr-wallet/unit";
import { cachified } from "cachified";

import {
  BridgeQuoteError,
  BridgeTransferStatusError,
} from "~/integrations/bridges/errors";

import {
  BridgeProvider,
  BridgeProviderContext,
  BridgeQuote,
  BridgeTransactionRequest,
  BridgeTransferStatus,
  GetBridgeQuoteParams,
  GetTransferStatusParams,
} from "../types";

const providerName = "Squid" as const;
const logoUrl = "/bridges/squid.svg" as const;
export class SquidBridgeProvider implements BridgeProvider {
  static providerName = providerName;
  providerName = providerName;
  logoUrl = logoUrl;
  apiURL: "https://api.0xsquid.com" | "https://testnet.api.squidrouter.com";

  squidScanBaseUrl: "https://axelarscan.io" | "https://testnet.axelarscan.io";

  constructor(
    readonly integratorId: string,
    readonly ctx: BridgeProviderContext
  ) {
    this.apiURL =
      ctx.env === "mainnet"
        ? "https://api.0xsquid.com"
        : "https://testnet.api.squidrouter.com";
    this.squidScanBaseUrl =
      ctx.env === "mainnet"
        ? "https://axelarscan.io"
        : "https://testnet.axelarscan.io";
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
        const url = new URL(`${this.apiURL}/v1/route`);

        const amount = new CoinPretty(
          {
            coinDecimals: fromAsset.decimals,
            coinDenom: fromAsset.denom,
            coinMinimalDenom: fromAsset.minimalDenom ?? fromAsset.denom,
          },
          fromAmount
        ).toCoin().amount;

        const getRouteParams: SquidGetRouteParams = {
          fromChain: fromChain.chainId.toString(),
          toChain: toChain.chainId.toString(),
          fromAddress,
          toAddress,
          fromAmount: amount,
          fromToken: fromAsset.address,
          toToken: toAsset.address,
          slippage,
          quoteOnly: false,
        };

        Object.entries(getRouteParams).forEach(([key, value]) => {
          url.searchParams.append(key, value.toString());
        });

        try {
          const response = await fetch(url.toString(), {
            headers: {
              "x-integrator-id": this.integratorId,
            },
          });
          const data: RouteResponse = await response.json();
          if (!response.ok) {
            throw data;
          }

          const {
            fromAmount: estimateFromAmount,
            toAmount,
            toAmountMin,
            feeCosts,
            estimatedRouteDuration,
            gasCosts,
          } = data.route.estimate;

          if (feeCosts.length > 1 || gasCosts.length > 1) {
            throw new BridgeQuoteError([
              {
                errorType: "Unsupported Quote",
                message:
                  "Osmosis FrontEnd only supports a single fee and gas costs",
              },
            ]);
          }

          if (!data.route.transactionRequest) {
            throw new BridgeQuoteError([
              {
                errorType: "Unsupported Quote",
                message:
                  "Squid failed to generate a transaction request for this quote",
              },
            ]);
          }

          const transactionRequest = data.route.transactionRequest;

          return {
            fromAmount: estimateFromAmount,
            toAmount: toAmount,
            toAmountMin: toAmountMin,
            transferFee: {
              denom: feeCosts[0].token.symbol,
              amount: feeCosts[0].amount,
              decimals: feeCosts[0].token.decimals,
              coinMinimalDenom: feeCosts[0].token.symbol,
              fiatValue: {
                currency: "usd",
                amount: feeCosts[0].amountUSD,
              },
            },
            estimatedTime: estimatedRouteDuration,
            estimatedGasFee: {
              denom: gasCosts[0].token.symbol,
              amount: gasCosts[0].amount,
              decimals: gasCosts[0].token.decimals,
              coinMinimalDenom: gasCosts[0].token.symbol,
              fiatValue: {
                currency: "usd",
                amount: gasCosts[0].amountUSD,
              },
            },
            transactionRequest:
              fromChain.chainType === "evm"
                ? {
                    type: "evm",
                    to: toAddress,
                    data: transactionRequest.data,
                    value:
                      transactionRequest.routeType !== "SEND"
                        ? transactionRequest.value
                        : undefined,
                  }
                : {
                    type: "cosmos",
                    /**
                     * TODO: Handle Cosmos transaction requests
                     */
                  },
          };
        } catch (e) {
          const error = e as
            | {
                errors: { errorType?: string; message?: string }[];
              }
            | BridgeQuoteError;

          if (error instanceof BridgeQuoteError) {
            throw error;
          }

          throw new BridgeQuoteError(
            error.errors?.map(({ errorType, message }) => ({
              errorType: errorType ?? "Unknown Error",
              message: message ?? "",
            }))
          );
        }
      },
      ttl: 20 * 1000, // 20 seconds,
    });
  }

  /**
   * Get the transfer status of the given transaction hash.
   * @see https://docs.squidrouter.com/sdk/get-route-status
   */
  async getTransferStatus(
    params: GetTransferStatusParams
  ): Promise<BridgeTransferStatus | undefined> {
    try {
      const { sendTxHash } = params;

      const response = await fetch(
        `${this.apiURL}/v1/status?transactionId=${sendTxHash}`
      );
      const data: StatusResponse = await response.json();
      if (!response.ok) {
        throw data;
      }

      if (!data || !data.id || !data.squidTransactionStatus) {
        return;
      }

      /**
       * Possible statuses from Squid:
       * SUCCESS = "success",
       * NEEDS_GAS = "needs_gas",
       * ONGOING = "ongoing",
       * PARTIAL_SUCCESS = "partial_success",
       * NOT_FOUND = "not_found"
       */
      const squidTransactionStatus = data.squidTransactionStatus as
        | "success"
        | "needs_gas"
        | "ongoing"
        | "partial_success"
        | "not_found";

      if (
        squidTransactionStatus === "not_found" ||
        squidTransactionStatus === "ongoing" ||
        squidTransactionStatus === "partial_success"
      ) {
        return;
      }

      return {
        id: data.id,
        status: squidTransactionStatus === "success" ? "success" : "failed",
        reason: data.status,
      };
    } catch (e) {
      const error = e as {
        errors: { errorType?: string; message?: string }[];
      };

      throw new BridgeTransferStatusError(
        error.errors?.map(({ errorType, message }) => ({
          errorType: errorType ?? "Unknown Error",
          message: message ?? "",
        }))
      );
    }
  }

  async getTransactionData(
    params: GetBridgeQuoteParams
  ): Promise<BridgeTransactionRequest> {
    return (await this.getQuote(params)).transactionRequest!;
  }
}
