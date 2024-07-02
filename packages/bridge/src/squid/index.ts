import {
  type ChainsResponse,
  ChainType,
  type GetRoute as SquidGetRouteParams,
  type RouteResponse,
  type TokensResponse,
  type TransactionRequest,
} from "@0xsquid/sdk";
import { Dec } from "@keplr-wallet/unit";
import { CosmosCounterparty, EVMCounterparty } from "@osmosis-labs/types";
import {
  apiClient,
  ApiClientError,
  EthereumChainInfo,
  isNil,
  NativeEVMTokenConstantAddress,
} from "@osmosis-labs/utils";
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

import { BridgeQuoteError } from "../errors";
import {
  BridgeAsset,
  BridgeChain,
  BridgeExternalUrl,
  BridgeProvider,
  BridgeProviderContext,
  BridgeQuote,
  BridgeTransactionRequest,
  CosmosBridgeTransactionRequest,
  EvmBridgeTransactionRequest,
  GetBridgeExternalUrlParams,
  GetBridgeQuoteParams,
  GetBridgeSupportedAssetsParams,
} from "../interface";
import { cosmosMsgOpts } from "../msg";
import { BridgeAssetMap } from "../utils";

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
      ttl: process.env.NODE_ENV === "test" ? -1 : 20 * 1000, // 20 seconds
      getFreshValue: async (): Promise<BridgeQuote> => {
        const getRouteParams: SquidGetRouteParams = {
          fromChain: fromChain.chainId.toString(),
          toChain: toChain.chainId.toString(),
          fromAddress,
          toAddress,
          fromAmount,
          fromToken: fromAsset.address,
          toToken: toAsset.address,
          slippage,
          quoteOnly: false,
          enableExpress: false,
          receiveGasOnDestination: false,
        };

        const url = new URL(`${this.apiURL}/v1/route`);
        Object.entries(getRouteParams).forEach(([key, value]) => {
          url.searchParams.append(key, value.toString());
        });
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
          throw new BridgeQuoteError({
            bridgeId: SquidBridgeProvider.ID,
            errorType: "UnsupportedQuoteError",
            message:
              "Osmosis FrontEnd only supports a single fee and gas costs",
          });
        }

        if (!data.route.transactionRequest) {
          throw new BridgeQuoteError({
            bridgeId: SquidBridgeProvider.ID,
            errorType: "UnsupportedQuoteError",
            message:
              "Squid failed to generate a transaction request for this quote",
          });
        }

        const transactionRequest = data.route.transactionRequest;
        const isEvmTransaction = fromChain.chainType === "evm";

        if (!aggregatePriceImpact) {
          throw new BridgeQuoteError({
            bridgeId: SquidBridgeProvider.ID,
            errorType: "UnsupportedQuoteError",
            message: "Squid failed to generate a price impact for this quote",
          });
        }

        if (
          data.route.params.toToken.address.toLowerCase() !==
          toAsset.address.toLowerCase()
        ) {
          throw new BridgeQuoteError({
            bridgeId: SquidBridgeProvider.ID,
            errorType: "UnsupportedQuoteError",
            message: "toAsset mismatch",
          });
        }

        if (
          isNil(toAmountUSD) ||
          isNil(fromAmountUSD) ||
          toAmount === "" ||
          fromAmountUSD === ""
        ) {
          throw new BridgeQuoteError({
            bridgeId: SquidBridgeProvider.ID,
            errorType: "UnsupportedQuoteError",
            message: "USD value not found",
          });
        }

        return {
          input: {
            ...fromAsset,
            amount: estimateFromAmount,
          },
          expectedOutput: {
            ...toAsset,
            amount: toAmount,
            priceImpact: new Dec(aggregatePriceImpact)
              .quo(new Dec(100))
              .toString(),
          },
          fromChain,
          toChain,
          transferFee: {
            denom: feeCosts[0].token.symbol,
            amount: feeCosts[0].amount,
            chainId: feeCosts[0].token.chainId,
            decimals: feeCosts[0].token.decimals,
            address: feeCosts[0].token.address,
          },
          estimatedTime: estimatedRouteDuration,
          estimatedGasFee: {
            denom: gasCosts[0].token.symbol,
            amount: gasCosts[0].amount,
            decimals: gasCosts[0].token.decimals,
            address: gasCosts[0].token.address,
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
      },
    });
  }

  async getSupportedAssets({
    chain,
    asset,
  }: GetBridgeSupportedAssetsParams): Promise<(BridgeChain & BridgeAsset)[]> {
    try {
      const [tokens, chains] = await Promise.all([
        this.getTokens(),
        this.getChains(),
      ]);
      const token = tokens.find(
        (t) =>
          (t.address.toLowerCase() === asset.address.toLowerCase() ||
            t.ibcDenom?.toLowerCase() === asset.address.toLowerCase()) &&
          // squid uses canonical chain IDs (numerical and string)
          t.chainId === chain.chainId
      );

      if (!token) throw new Error("Token not found: " + asset.address);

      const foundVariants = new BridgeAssetMap<BridgeChain & BridgeAsset>();

      // asset list counterparties
      const assetListAsset = this.ctx.assetLists
        .flatMap(({ assets }) => assets)
        .find((a) => a.coinMinimalDenom === asset.address);

      for (const counterparty of assetListAsset?.counterparty ?? []) {
        // check if supported by squid
        if (!("chainId" in counterparty)) continue;
        if (
          !tokens.some(
            (t) =>
              t.address.toLowerCase() ===
                counterparty.sourceDenom.toLowerCase() &&
              t.chainId === counterparty.chainId
          )
        )
          continue;

        if (counterparty.chainType === "cosmos") {
          const c = counterparty as CosmosCounterparty;

          foundVariants.setAsset(c.chainId, c.sourceDenom, {
            chainId: c.chainId,
            chainType: "cosmos",
            address: c.sourceDenom,
            denom: c.symbol,
            decimals: c.decimals,
          });
        }
        if (counterparty.chainType === "evm") {
          const c = counterparty as EVMCounterparty;

          foundVariants.setAsset(c.chainId.toString(), c.sourceDenom, {
            chainId: c.chainId,
            chainType: "evm",
            address: c.sourceDenom,
            denom: c.symbol,
            decimals: c.decimals,
          });
        }
      }

      // leverage squid's "commonKey" to gather other like source assets for toToken
      const tokenVariants = tokens
        .filter(
          (t) =>
            t.commonKey &&
            token.commonKey &&
            t.commonKey === token.commonKey &&
            t.address !== token.address &&
            t.chainId !== token.chainId
        )
        .map((t) => {
          const chain = chains.find(({ chainId }) => chainId === t.chainId);
          if (!chain) return;
          return { ...t, ...chain };
        })
        .filter((t): t is NonNullable<typeof t> => !!t);

      for (const variant of tokenVariants) {
        const chainInfo =
          variant.chainType === ChainType.EVM
            ? {
                chainId: variant.chainId as number,
                chainType: "evm" as const,
              }
            : {
                chainId: variant.chainId as string,
                chainType: "cosmos" as const,
              };

        foundVariants.setAsset(variant.chainId.toString(), variant.address, {
          // squid chain list IDs are canonical
          ...chainInfo,
          chainName: variant.chainName,
          denom: variant.symbol,
          address: variant.address,
          decimals: variant.decimals,
        });
      }

      return foundVariants.assets;
    } catch (e) {
      // Avoid returning options if there's an unexpected error, such as the provider being down
      if (process.env.NODE_ENV === "development") {
        console.error(
          SquidBridgeProvider.ID,
          "failed to get supported assets:",
          e
        );
      }
      return [];
    }
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
      throw new BridgeQuoteError({
        bridgeId: SquidBridgeProvider.ID,
        errorType: "ApprovalTxError",
        message: "Error getting approval Tx",
      });
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
      throw new BridgeQuoteError({
        bridgeId: SquidBridgeProvider.ID,
        errorType: "ApprovalTxError",
        message: `Error creating approval Tx: ${e}`,
      });
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
        throw new BridgeQuoteError({
          bridgeId: SquidBridgeProvider.ID,
          errorType: "CreateCosmosTxError",
          message:
            "Unknown message type. Osmosis FrontEnd only supports the transfer message type",
        });
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
        throw new BridgeQuoteError({
          bridgeId: SquidBridgeProvider.ID,
          errorType: "CreateCosmosTxError",
          message: error.message,
        });
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
      ttl: process.env.NODE_ENV === "test" ? -1 : 30 * 60 * 1000, // 30 minutes
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
      ttl: process.env.NODE_ENV === "test" ? -1 : 30 * 60 * 1000, // 30 minutes
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

  async getExternalUrl({
    fromChain,
    toChain,
    fromAsset,
    toAsset,
  }: GetBridgeExternalUrlParams): Promise<BridgeExternalUrl | undefined> {
    // TODO get axelar ID for both assets
    const url = new URL(
      this.ctx.env === "mainnet"
        ? "https://app.squidrouter.com/"
        : "https://testnet.app.squidrouter.com/"
    );
    url.searchParams.set(
      "chains",
      [fromChain.chainId, toChain.chainId].join(",")
    );
    url.searchParams.set(
      "tokens",
      [fromAsset.address, toAsset.address].join(",")
    );

    return { urlProviderName: "Squid", url };
  }
}

export * from "./transfer-status";
