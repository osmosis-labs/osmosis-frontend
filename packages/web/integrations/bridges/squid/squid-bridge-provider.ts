import type {
  ChainsResponse,
  GetRoute as SquidGetRouteParams,
  RouteResponse,
  StatusResponse,
  TransactionRequest,
} from "@0xsquid/sdk";
import { ChainIdHelper } from "@keplr-wallet/cosmos";
import { CoinPretty, Int } from "@keplr-wallet/unit";
import { cosmosMsgOpts } from "@osmosis-labs/stores";
import { cachified } from "cachified";
import { ethers } from "ethers";
import Long from "long";
import { toHex } from "web3-utils";

import { ChainInfos } from "~/config";
import {
  BridgeQuoteError,
  BridgeTransferStatusError,
} from "~/integrations/bridges/errors";
import { Erc20Abi } from "~/integrations/ethereum";
import { queryRPCStatus } from "~/queries/cosmos/rpc-status";
import { apiClient, ApiClientError } from "~/utils/api-client";

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
const logoUrl = "/bridges/squid.svg" as const;

/**
 * Placeholder for the native ETH token. This is used by protocols to refer to the Ether token, in order, to allow
 * for ETH to be handled similarly to other ERC20 tokens.
 */
const NativeTokenConstant = "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE";

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
          const data = await apiClient<RouteResponse>(url.toString(), {
            headers: {
              "x-integrator-id": this.integratorId,
            },
          });

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

          return {
            fromAmount: estimateFromAmount,
            toAmount: toAmount,
            toAmountMin: toAmountMin,
            fromChain,
            toChain,
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
            error.data.errors?.map(({ errorType, message }) => ({
              errorType: errorType ?? "Unknown Error",
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
    const isFromAssetNative = fromAsset.address === NativeTokenConstant;
    const squidFromChain = (await this.getChains()).find(({ chainId }) => {
      return chainId === fromChain.chainId;
    });

    if (!squidFromChain) {
      throw new BridgeQuoteError([
        {
          errorType: "Approval Tx",
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
          errorType: "Approval Transaction",
          message: `Error getting approval Tx`,
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

    if (parsedData.msgTypeUrl !== "/ibc.applications.transfer.v1.MsgTransfer") {
      throw new BridgeQuoteError([
        {
          errorType: "Cosmos Tx",
          message:
            "Unknown message type. Osmosis FrontEnd only supports the transfer message type",
        },
      ]);
    }

    const destinationCosmosChain = ChainInfos.find((chain) => {
      return parsedData.msg.receiver.startsWith(
        chain.bech32Config.bech32PrefixAccAddr
      );
    });

    if (!destinationCosmosChain) {
      throw new BridgeQuoteError([
        {
          errorType: "Unsupported Quote",
          message: "Could not find destination Cosmos chain",
        },
      ]);
    }

    const destinationNodeStatus = await queryRPCStatus({
      restUrl: destinationCosmosChain.rpc,
    });

    const network = destinationNodeStatus.result.node_info.network;
    const latestBlockHeight =
      destinationNodeStatus.result.sync_info.latest_block_height;

    if (!network) {
      throw new Error(
        `Failed to fetch the network chain id of ${destinationCosmosChain.chainId}`
      );
    }

    if (!latestBlockHeight || latestBlockHeight === "0") {
      throw new Error(
        `Failed to fetch the latest block of ${destinationCosmosChain.chainId}`
      );
    }

    const revisionNumber = ChainIdHelper.parse(network).version.toString();

    const { typeUrl, value: msg } = cosmosMsgOpts.ibcTransfer.messageComposer({
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
      timeoutHeight: {
        /**
         * Omit the revision_number if the chain's version is 0.
         * Sending the value as 0 will cause the transaction to fail.
         */
        revisionNumber:
          revisionNumber !== "0" ? revisionNumber : (undefined as any),
        revisionHeight: new Int(latestBlockHeight)
          .add(new Int("150"))
          .toString() as any,
      },
      token: parsedData.msg.token,
    });

    return {
      type: "cosmos",
      msgTypeUrl: typeUrl,
      msg,
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
        error.data.errors?.map(({ errorType, message }) => ({
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
