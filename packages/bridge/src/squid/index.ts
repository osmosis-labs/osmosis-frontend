import {
  type ChainsResponse,
  ChainType,
  type GetRoute as SquidGetRouteParams,
  type RouteResponse,
  type TokensResponse,
  type TransactionRequest,
} from "@0xsquid/sdk";
import { CoinPretty, Dec } from "@keplr-wallet/unit";
import { apiClient, ApiClientError, isNil } from "@osmosis-labs/utils";
import { cachified } from "cachified";
import Long from "long";
import {
  Address,
  createPublicClient,
  encodeFunctionData,
  erc20Abi,
  http,
  numberToHex,
} from "viem";

import { BridgeError, BridgeQuoteError } from "../errors";
import { EthereumChainInfo, NativeEVMTokenConstantAddress } from "../ethereum";
import {
  BridgeAsset,
  BridgeChain,
  BridgeDepositAddress,
  BridgeProvider,
  BridgeProviderContext,
  BridgeQuote,
  BridgeTransactionRequest,
  CosmosBridgeTransactionRequest,
  EvmBridgeTransactionRequest,
  GetBridgeQuoteParams,
  GetDepositAddressParams,
} from "../interface";
import { cosmosMsgOpts } from "../msg";

const IbcTransferType = "/ibc.applications.transfer.v1.MsgTransfer";
const WasmTransferType = "/cosmwasm.wasm.v1.MsgExecuteContract";
export class SquidBridgeProvider implements BridgeProvider {
  static readonly ID = "Squid";
  readonly providerName = SquidBridgeProvider.ID;

  protected readonly apiURL: string;
  protected readonly squidScanBaseUrl: string;

  constructor(
    protected readonly integratorId: string,
    protected readonly ctx: BridgeProviderContext
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
  getDepositAddress?:
    | ((params: GetDepositAddressParams) => Promise<BridgeDepositAddress>)
    | undefined;

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
        id: SquidBridgeProvider.ID,
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
                errorType: BridgeError.UnsupportedQuoteError,
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
                errorType: BridgeError.UnsupportedQuoteError,
                message:
                  "Osmosis FrontEnd only supports a single fee and gas costs",
              },
            ]);
          }

          if (!data.route.transactionRequest) {
            throw new BridgeQuoteError([
              {
                errorType: BridgeError.UnsupportedQuoteError,
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
                errorType: BridgeError.UnsupportedQuoteError,
                message:
                  "Squid failed to generate a price impact for this quote",
              },
            ]);
          }

          if (data.route.params.toToken.address !== toAsset.address) {
            throw new BridgeQuoteError([
              {
                errorType: BridgeError.UnsupportedQuoteError,
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
                errorType: BridgeError.UnsupportedQuoteError,
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
            },
            expectedOutput: {
              amount: toAmount,
              sourceDenom: toAsset.sourceDenom ?? toAsset.denom,
              decimals: toAsset.decimals,
              denom: toAsset.denom,
              priceImpact: new Dec(aggregatePriceImpact)
                .quo(new Dec(100))
                .toString(),
            },
            fromChain,
            toChain,
            transferFee: {
              denom: feeCosts[0].token.symbol,
              amount: feeCosts[0].amount,
              decimals: feeCosts[0].token.decimals,
              sourceDenom: feeCosts[0].token.symbol,
            },
            estimatedTime: estimatedRouteDuration,
            estimatedGasFee: {
              denom: gasCosts[0].token.symbol,
              amount: gasCosts[0].amount,
              decimals: gasCosts[0].token.decimals,
              sourceDenom: gasCosts[0].token.symbol,
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
              errorType: errorType ?? BridgeError.UnexpectedError,
              message: message ?? "",
            }))
          );
        }
      },
      ttl: 20 * 1000, // 20 seconds,
    });
  }

  async getAvailableSourceAssetVariants(
    toChain: BridgeChain,
    toAsset: BridgeAsset
  ): Promise<(BridgeChain & BridgeAsset)[]> {
    const tokens = await this.getTokens();
    const toToken = tokens.find(
      (t) =>
        (t.address === toAsset.address || t.ibcDenom === toAsset.address) &&
        // squid uses canonical chain IDs (numerical and string)
        t.chainId === toChain.chainId
    );

    if (!toToken) return [];

    // leverage squid's "commonKey" to gather other like source assets for toToken
    const chains = await this.getChains();
    const commonSourceChainTokens = tokens
      .filter(
        (t) =>
          (t.commonKey === toToken.commonKey ||
            // common coingeckoIDs can be used to identify the same variants
            t.coingeckoId === toToken.coingeckoId) &&
          t.address !== toToken.address
      )
      .map((t) => {
        const chain = chains.find(({ chainId }) => chainId === t.chainId);
        if (!chain) return;
        return { ...t, ...chain };
      })
      .filter((t): t is NonNullable<typeof t> => !!t);

    return commonSourceChainTokens.map((chainToken) => {
      const chainInfo =
        chainToken.chainType === ChainType.EVM
          ? {
              chainId: chainToken.chainId as number,
              chainType: "evm" as const,
            }
          : {
              chainId: chainToken.chainId as string,
              chainType: "cosmos" as const,
            };

      return {
        // squid chain list IDs are canonical
        ...chainInfo,
        chainName: chainToken.chainName,
        denom: chainToken.symbol,
        address: chainToken.address,
        decimals: chainToken.decimals,
        sourceDenom: chainToken.address,
      };
    });
  }

  async createEvmTransaction({
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
      return String(chainId) === String(fromChain.chainId);
    });

    if (!squidFromChain) {
      throw new BridgeQuoteError([
        {
          errorType: BridgeError.CreateApprovalTxError,
          message: `Error getting approval Tx`,
        },
      ]);
    }

    let approvalTx: { to: Address; data: string } | undefined;
    try {
      const evmChain = Object.values(EthereumChainInfo).find(
        ({ id: chainId }) => String(chainId) === String(squidFromChain.chainId)
      );

      if (!evmChain) {
        throw new Error("Could not find EVM chain");
      }

      const fromTokenContract = createPublicClient({
        chain: evmChain,
        transport: http(evmChain.rpcUrls.default.http[0]),
      });

      approvalTx = await this.getApprovalTx({
        fromAddress: fromAddress as Address,
        fromAmount: estimateFromAmount,
        fromChain,
        isFromAssetNative,
        fromTokenContract,
        targetAddress: transactionRequest.targetAddress as Address,
        tokenAddress: fromAsset.address as Address,
      });
    } catch (e) {
      throw new BridgeQuoteError([
        {
          errorType: BridgeError.CreateApprovalTxError,
          message: `Error creating approval Tx`,
        },
      ]);
    }

    return {
      type: "evm",
      to: transactionRequest.targetAddress as Address,
      data: transactionRequest.data as Address,
      value:
        transactionRequest.routeType !== "SEND"
          ? numberToHex(BigInt(transactionRequest.value))
          : undefined,
      ...(transactionRequest.maxPriorityFeePerGas
        ? {
            gas: numberToHex(BigInt(transactionRequest.gasLimit)),
            maxFeePerGas: numberToHex(BigInt(transactionRequest.maxFeePerGas)),
            maxPriorityFeePerGas: numberToHex(
              BigInt(transactionRequest.maxPriorityFeePerGas)
            ),
          }
        : {
            gas: numberToHex(BigInt(transactionRequest.gasLimit)),
            gasPrice: numberToHex(BigInt(transactionRequest.gasPrice)),
          }),
      approvalTransactionRequest: approvalTx,
    };
  }

  /** TODO: Handle WASM transactions */
  async createCosmosTransaction(
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
            errorType: BridgeError.CreateCosmosTxError,
            message:
              "Unknown message type. Osmosis FrontEnd only supports the transfer message type",
          },
        ]);
      }

      const timeoutHeight = await this.ctx.getTimeoutHeight({
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
            errorType: BridgeError.CreateCosmosTxError,
            message: error.message,
          },
        ]);
      }

      throw error;
    }
  }

  async getTransactionData(
    params: GetBridgeQuoteParams
  ): Promise<BridgeTransactionRequest> {
    return (await this.getQuote(params)).transactionRequest!;
  }

  getChains() {
    return cachified({
      cache: this.ctx.cache,
      key: SquidBridgeProvider.ID + "_chains",
      ttl: 30 * 60 * 1000, // 30 minutes
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
    });
  }

  getTokens() {
    return cachified({
      cache: this.ctx.cache,
      key: SquidBridgeProvider.ID + "_tokens",
      ttl: 30 * 60 * 1000, // 30 minutes
      getFreshValue: async () => {
        try {
          const data = await apiClient<TokensResponse>(
            `${this.apiURL}/v1/tokens`
          );
          return data.tokens;
        } catch (e) {
          const error = e as ApiClientError;
          throw error.data;
        }
      },
    });
  }

  async getApprovalTx({
    fromTokenContract,
    fromAmount,
    isFromAssetNative,
    fromAddress,
    targetAddress,
    tokenAddress,
  }: {
    fromTokenContract: ReturnType<typeof createPublicClient>;
    tokenAddress: Address;
    isFromAssetNative: boolean;
    fromAmount: string;
    fromAddress: Address;
    fromChain: BridgeChain;
    /**
     * The address of the contract that will be called with the approval, in this case, Squid's router contract.
     */
    targetAddress: Address;
  }) {
    const _sourceAmount = BigInt(fromAmount);

    if (!isFromAssetNative) {
      const allowance = await fromTokenContract.readContract({
        abi: erc20Abi,
        address: tokenAddress,
        functionName: "allowance",
        args: [fromAddress, targetAddress],
      });

      if (_sourceAmount > allowance) {
        const amountToApprove = _sourceAmount;

        const approveTxData = encodeFunctionData({
          abi: erc20Abi,
          functionName: "approve",
          args: [targetAddress, BigInt(amountToApprove)],
        });

        return {
          to: tokenAddress,
          data: approveTxData,
        };
      }
    }
  }
}

export * from "./transfer-status";
