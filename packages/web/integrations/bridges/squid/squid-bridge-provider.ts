import type {
  ChainsResponse,
  GetRoute as SquidGetRouteParams,
  RouteResponse,
  StatusResponse,
  TransactionRequest,
} from "@0xsquid/sdk";
import { CoinPretty, Dec } from "@keplr-wallet/unit";
import { cosmosMsgOpts } from "@osmosis-labs/stores";
import { isNil } from "@osmosis-labs/utils";
import { apiClient, ApiClientError } from "@osmosis-labs/utils";
import { cachified } from "cachified";
import { ethers } from "ethers";
import Long from "long";
import { toHex } from "web3-utils";

import {
  BridgeQuoteError,
  BridgeTransferStatusError,
} from "~/integrations/bridges/errors";
import { removeAllCommas } from "~/integrations/bridges/squid/squid-bridge-utils";
import {
  Erc20Abi,
  NativeEVMTokenConstantAddress,
} from "~/integrations/ethereum";
import { getTimeoutHeight } from "~/server/queries/complex/get-timeout-height";
import { ErrorTypes } from "~/utils/error-types";

import {
  BridgeAsset,
  BridgeChain,
  BridgeProvider,
  BridgeProviderContext,
  BridgeQuote,
  BridgeTransactionRequest,
  BridgeTransferStatus,
  CosmosBridgeTransactionRequest,
  EvmBridgeTransactionRequest,
  GetBridgeQuoteParams,
  GetTransferStatusParams,
} from "../types";

const providerName = "Squid" as const;
const logoUrl =
  `${process.env.NEXT_PUBLIC_BASEPATH}/bridges/squid.svg` as const;

const IbcTransferType = "/ibc.applications.transfer.v1.MsgTransfer";
const WasmTransferType = "/cosmwasm.wasm.v1.MsgExecuteContract";
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
            coinMinimalDenom: fromAsset.sourceDenom ?? fromAsset.denom,
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
          if (fromChain.chainType === "cosmos") {
            throw new BridgeQuoteError([
              {
                errorType: ErrorTypes.UnsupportedQuoteError,
                message:
                  "Squid withdrawals are temporarily disabled. Please use the Axelar Bridge Provider instead.",
              },
            ]);
          }

          const data = await apiClient<RouteResponse>(url.toString(), {
            headers: {
              "x-integrator-id": this.integratorId,
            },
          });

          const {
            fromAmount: estimateFromAmount,
            toAmount,
            feeCosts,
            estimatedRouteDuration,
            gasCosts,
            aggregatePriceImpact,
            fromAmountUSD,
            toAmountUSD,
          } = data.route.estimate;

          if (feeCosts.length > 1 || gasCosts.length > 1) {
            throw new BridgeQuoteError([
              {
                errorType: ErrorTypes.UnsupportedQuoteError,
                message:
                  "Osmosis FrontEnd only supports a single fee and gas costs",
              },
            ]);
          }

          if (!data.route.transactionRequest) {
            throw new BridgeQuoteError([
              {
                errorType: ErrorTypes.UnsupportedQuoteError,
                message:
                  "Squid failed to generate a transaction request for this quote",
              },
            ]);
          }

          const transactionRequest = data.route.transactionRequest;
          const isEvmTransaction = fromChain.chainType === "evm";

          if (!aggregatePriceImpact) {
            throw new BridgeQuoteError([
              {
                errorType: ErrorTypes.UnsupportedQuoteError,
                message:
                  "Squid failed to generate a price impact for this quote",
              },
            ]);
          }

          if (data.route.params.toToken.address !== toAsset.address) {
            throw new BridgeQuoteError([
              {
                errorType: ErrorTypes.UnsupportedQuoteError,
                message: "toAsset mismatch",
              },
            ]);
          }

          if (
            isNil(toAmountUSD) ||
            isNil(fromAmountUSD) ||
            toAmount === "" ||
            fromAmountUSD === ""
          ) {
            throw new BridgeQuoteError([
              {
                errorType: ErrorTypes.UnsupportedQuoteError,
                message: "USD value not found",
              },
            ]);
          }

          return {
            input: {
              amount: estimateFromAmount,
              sourceDenom: fromAsset.sourceDenom,
              decimals: fromAsset.decimals,
              denom: fromAsset.denom,
              fiatValue: {
                currency: "usd",
                amount: removeAllCommas(fromAmountUSD),
              },
            },
            expectedOutput: {
              amount: toAmount,
              sourceDenom: toAsset.sourceDenom ?? toAsset.denom,
              decimals: toAsset.decimals,
              denom: toAsset.denom,
              priceImpact: new Dec(aggregatePriceImpact)
                .quo(new Dec(100))
                .toString(),
              fiatValue: {
                currency: "usd",
                amount: removeAllCommas(toAmountUSD),
              },
            },
            fromChain,
            toChain,
            transferFee: {
              denom: feeCosts[0].token.symbol,
              amount: feeCosts[0].amount,
              decimals: feeCosts[0].token.decimals,
              sourceDenom: feeCosts[0].token.symbol,
              fiatValue: {
                currency: "usd",
                amount: removeAllCommas(feeCosts[0].amountUSD),
              },
            },
            estimatedTime: estimatedRouteDuration,
            estimatedGasFee: {
              denom: gasCosts[0].token.symbol,
              amount: gasCosts[0].amount,
              decimals: gasCosts[0].token.decimals,
              sourceDenom: gasCosts[0].token.symbol,
              fiatValue: {
                currency: "usd",
                amount: removeAllCommas(gasCosts[0].amountUSD),
              },
            },
            transactionRequest: isEvmTransaction
              ? await this.createEvmTransaction({
                  fromAsset,
                  fromChain,
                  fromAddress,
                  estimateFromAmount,
                  transactionRequest,
                })
              : await this.createCosmosTransaction(transactionRequest.data),
          };
        } catch (e) {
          const error = e as
            | ApiClientError<{
                errors: { errorType?: string; message?: string }[];
              }>
            | BridgeQuoteError;

          if (error instanceof BridgeQuoteError) {
            throw error;
          }

          throw new BridgeQuoteError(
            error.data?.errors?.map(({ errorType, message }) => ({
              errorType: errorType ?? ErrorTypes.UnexpectedError,
              message: message ?? "",
            }))
          );
        }
      },
      ttl: 20 * 1000, // 20 seconds,
    });
  }

  private async createEvmTransaction({
    fromAsset,
    fromChain,
    fromAddress,
    estimateFromAmount,
    transactionRequest,
  }: {
    fromAsset: BridgeAsset;
    fromChain: BridgeChain;
    fromAddress: string;
    estimateFromAmount: string;
    transactionRequest: TransactionRequest;
  }): Promise<EvmBridgeTransactionRequest> {
    const isFromAssetNative =
      fromAsset.address === NativeEVMTokenConstantAddress;
    const squidFromChain = (await this.getChains()).find(({ chainId }) => {
      return chainId === fromChain.chainId;
    });

    if (!squidFromChain) {
      throw new BridgeQuoteError([
        {
          errorType: ErrorTypes.CreateApprovalTxError,
          message: `Error getting approval Tx`,
        },
      ]);
    }

    let approvalTx: ethers.ContractTransaction | undefined;
    try {
      const fromProvider = new ethers.JsonRpcProvider(squidFromChain.rpc);
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
          errorType: ErrorTypes.CreateApprovalTxError,
          message: `Error creating approval Tx`,
        },
      ]);
    }

    return {
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
    };
  }

  /** TODO: Handle WASM transactions */
  private async createCosmosTransaction(
    data: string
  ): Promise<CosmosBridgeTransactionRequest> {
    try {
      const parsedData = JSON.parse(data) as {
        msgTypeUrl: typeof IbcTransferType | typeof WasmTransferType;
        msg: {
          sourcePort: string;
          sourceChannel: string;
          token: {
            denom: string;
            amount: string;
          };
          sender: string;
          receiver: string;
          timeoutTimestamp: {
            low: number;
            high: number;
            unsigned: boolean;
          };
          memo: string;
        };
      };

      if (
        parsedData.msgTypeUrl !== "/ibc.applications.transfer.v1.MsgTransfer"
      ) {
        throw new BridgeQuoteError([
          {
            errorType: ErrorTypes.CreateCosmosTxError,
            message:
              "Unknown message type. Osmosis FrontEnd only supports the transfer message type",
          },
        ]);
      }

      const timeoutHeight = await getTimeoutHeight({
        destinationAddress: parsedData.msg.receiver,
      });

      const { typeUrl, value: msg } = cosmosMsgOpts.ibcTransfer.messageComposer(
        {
          memo: parsedData.msg.memo,
          receiver: parsedData.msg.receiver,
          sender: parsedData.msg.sender,
          sourceChannel: parsedData.msg.sourceChannel,
          sourcePort: parsedData.msg.sourcePort,
          timeoutTimestamp: new Long(
            parsedData.msg.timeoutTimestamp.low,
            parsedData.msg.timeoutTimestamp.high,
            parsedData.msg.timeoutTimestamp.unsigned
          ).toString() as any,
          // @ts-ignore
          timeoutHeight,
          token: parsedData.msg.token,
        }
      );

      return {
        type: "cosmos",
        msgTypeUrl: typeUrl,
        msg,
      };
    } catch (e) {
      const error = e as Error | BridgeQuoteError;

      if (error instanceof Error) {
        throw new BridgeQuoteError([
          {
            errorType: ErrorTypes.CreateCosmosTxError,
            message: error.message,
          },
        ]);
      }

      throw error;
    }
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

      const url = new URL(`${this.apiURL}/v1/status`);
      url.searchParams.append("transactionId", sendTxHash);
      if (params.fromChainId) {
        url.searchParams.append("fromChainId", params.fromChainId.toString());
      }
      if (params.toChainId) {
        url.searchParams.append("toChainId", params.toChainId.toString());
      }

      const data = await apiClient<StatusResponse>(url.toString());

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
        reason:
          squidTransactionStatus === "needs_gas"
            ? "insufficientFee"
            : undefined,
      };
    } catch (e) {
      const error = e as ApiClientError<{
        errors: { errorType?: string; message?: string }[];
      }>;

      throw new BridgeTransferStatusError(
        error.data?.errors?.map(
          ({ errorType, message }) =>
            ({
              errorType: errorType ?? ErrorTypes.UnexpectedError,
              message: message ?? "",
            } ?? [
              {
                errorType: ErrorTypes.UnexpectedError,
                message: "Failed to fetch transfer status",
              },
            ])
        )
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
        try {
          const data = await apiClient<ChainsResponse>(
            `${this.apiURL}/v1/chains`
          );
          return data.chains;
        } catch (e) {
          const error = e as ApiClientError;
          throw error.data;
        }
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
