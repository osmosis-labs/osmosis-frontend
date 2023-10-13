import type {
  ChainsResponse,
  GetRoute as SquidGetRouteParams,
  RouteResponse,
  StatusResponse,
} from "@0xsquid/sdk";
import { CoinPretty } from "@keplr-wallet/unit";
import { cachified } from "cachified";
import { ethers } from "ethers";
import Long from "long";
import { toHex } from "web3-utils";

import {
  BridgeQuoteError,
  BridgeTransferStatusError,
} from "~/integrations/bridges/errors";
import { Erc20Abi } from "~/integrations/ethereum";

import {
  BridgeChain,
  BridgeProvider,
  BridgeProviderContext,
  BridgeQuote,
  BridgeTransactionRequest,
  BridgeTransferStatus,
  CosmosBridgeTransactionRequest,
  GetBridgeQuoteParams,
  GetTransferStatusParams,
} from "../types";

const providerName = "Squid" as const;
const logoUrl = "/bridges/squid.svg" as const;

/**
 * Placeholder for the native ETH token. This is used by protocols to refer to the Ether token, in order, to allow
 * for ETH to be handled similarly to other ERC20 tokens.
 */
const NativeTokenConstant = "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE";
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
          const isEvmTransaction = fromChain.chainType === "evm";

          let approvalTx: ethers.ContractTransaction | undefined;
          if (isEvmTransaction) {
            const isFromAssetNative = fromAsset.address === NativeTokenConstant;
            const squidFromChain = (await this.getChains()).find(
              ({ chainId }) => {
                return chainId === fromChain.chainId;
              }
            );

            if (!squidFromChain) {
              throw new BridgeQuoteError([
                {
                  errorType: "Approval Tx",
                  message: `Error getting approval Tx`,
                },
              ]);
            }

            try {
              const fromProvider = new ethers.JsonRpcProvider(
                squidFromChain.rpc
              );
              const fromTokenContract = new ethers.Contract(
                fromAsset.address,
                Erc20Abi,
                fromProvider
              );
              approvalTx = await this.getApprovalTx({
                fromAddress,
                fromAmount: estimateFromAmount,
                fromChain,
                isFromAssetNative,
                fromTokenContract,
                targetAddress: transactionRequest.targetAddress,
              });
            } catch (e) {
              throw new BridgeQuoteError([
                {
                  errorType: "Approval Transaction",
                  message: `Error getting approval Tx`,
                },
              ]);
            }
          }

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
            transactionRequest: isEvmTransaction
              ? {
                  type: "evm",
                  to: transactionRequest.targetAddress,
                  data: transactionRequest.data,
                  value:
                    transactionRequest.routeType !== "SEND"
                      ? toHex(transactionRequest.value)
                      : undefined,
                  ...(transactionRequest.maxPriorityFeePerGas
                    ? {
                        gas: toHex(transactionRequest.gasLimit),
                        maxFeePerGas: toHex(transactionRequest.maxFeePerGas),
                        maxPriorityFeePerGas: toHex(
                          transactionRequest.maxPriorityFeePerGas
                        ),
                      }
                    : {
                        gas: toHex(transactionRequest.gasLimit),
                        gasPrice: toHex(transactionRequest.gasPrice),
                      }),
                  approvalTransactionRequest: approvalTx,
                }
              : this.getCosmosTransaction(transactionRequest.data),
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

  getCosmosTransaction(data: string): CosmosBridgeTransactionRequest {
    const parsedData = JSON.parse(data);

    return {
      type: "cosmos",
      msgTypeUrl: parsedData.msgTypeUrl,
      msg: {
        ...parsedData.msg,
        timeoutTimestamp: new Long(
          parsedData.msg.timeoutTimestamp.low,
          parsedData.msg.timeoutTimestamp.high,
          parsedData.msg.timeoutTimestamp.unsigned
        ).toString(),
      },
    };
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
        id: sendTxHash,
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

  async getChains() {
    return cachified({
      cache: this.ctx.cache,
      key: "chains",
      getFreshValue: async () => {
        const response = await fetch(`${this.apiURL}/v1/chains`);
        const data: ChainsResponse = await response.json();

        if (!response.ok) {
          throw data;
        }

        return data.chains;
      },
      // 30 minutes
      ttl: 30 * 60 * 1000,
    });
  }

  private async getApprovalTx({
    fromTokenContract,
    fromAmount,
    isFromAssetNative,
    fromAddress,
    targetAddress,
  }: {
    fromTokenContract: ethers.Contract;
    isFromAssetNative: boolean;
    fromAmount: string;
    fromAddress: string;
    fromChain: BridgeChain;
    /**
     * The address of the contract that will be called with the approval, in this case, Squid's router contract.
     */
    targetAddress: string;
  }) {
    const _sourceAmount = BigInt(fromAmount);

    if (!isFromAssetNative) {
      const allowance = await fromTokenContract.allowance(
        fromAddress,
        targetAddress
      );

      if (_sourceAmount > allowance) {
        const amountToApprove = _sourceAmount;

        const approveTx = await fromTokenContract.approve.populateTransaction(
          targetAddress,
          amountToApprove
        );

        return approveTx;
      }
    }
  }
}
