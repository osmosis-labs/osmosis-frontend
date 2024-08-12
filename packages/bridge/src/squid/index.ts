import {
  type ChainsResponse,
  ChainType,
  type GetRoute as SquidGetRouteParams,
  type RouteResponse,
  type TokensResponse,
  type TransactionRequest,
} from "@0xsquid/sdk";
import { Dec } from "@keplr-wallet/unit";
import {
  makeExecuteCosmwasmContractMsg,
  makeIBCTransferMsg,
} from "@osmosis-labs/tx";
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
  BridgeDepositAddress,
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
  GetDepositAddressParams,
} from "../interface";
import { BridgeAssetMap } from "../utils";
import { getSquidErrors } from "./error";

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
        }).catch((e) => {
          if (e instanceof ApiClientError) {
            const errMsgs = getSquidErrors(e);

            if (
              errMsgs.errors.some(({ message }) =>
                message.includes(
                  "The input amount is not high enough to cover the bridge fee"
                )
              )
            ) {
              throw new BridgeQuoteError({
                bridgeId: SquidBridgeProvider.ID,
                errorType: "InsufficientAmountError",
                message: e.message,
              });
            }
            if (
              errMsgs.errors.some(({ message }) =>
                message.includes(
                  "No paths found, please choose a different token pair"
                )
              )
            ) {
              throw new BridgeQuoteError({
                bridgeId: SquidBridgeProvider.ID,
                errorType: "NoQuotesError",
                message: e.message,
              });
            }
          }

          throw e;
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
          transferFee:
            feeCosts.length === 1
              ? {
                  denom: feeCosts[0].token.symbol,
                  amount: feeCosts[0].amount,
                  chainId: feeCosts[0].token.chainId,
                  decimals: feeCosts[0].token.decimals,
                  address: feeCosts[0].token.address,
                }
              : {
                  ...fromAsset,
                  chainId: fromChain.chainId,
                  amount: "0",
                },
          estimatedTime: estimatedRouteDuration,
          estimatedGasFee:
            gasCosts.length === 1
              ? {
                  denom: gasCosts[0].token.symbol,
                  amount: gasCosts[0].amount,
                  decimals: gasCosts[0].token.decimals,
                  address: gasCosts[0].token.address,
                }
              : {
                  ...fromAsset,
                  amount: "0",
                },
          transactionRequest: isEvmTransaction
            ? await this.createEvmTransaction({
                fromAsset,
                fromChain,
                fromAddress,
                estimateFromAmount,
                transactionRequest,
              })
            : await this.createCosmosTransaction(
                transactionRequest.data,
                fromAddress,
                toChain,
                { denom: fromAsset.address, amount: fromAmount }
                // TODO: uncomment when we're able to find a way to get gas limit from Squid
                // or get it ourselves
                // gasCosts.length === 1
                //   ? {
                //       gas: gasCosts[0].estimate,
                //       denom: gasCosts[0].token.address,
                //       amount: gasCosts[0].amount,
                //     }
                //   : undefined
              ),
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
        const address =
          "address" in counterparty
            ? counterparty.address
            : counterparty.sourceDenom;

        const squidToken = tokens.find(
          (t) =>
            t.address.toLowerCase() === address.toLowerCase() &&
            t.chainId === counterparty.chainId
        );
        if (!squidToken) continue;

        if (counterparty.chainType === "cosmos") {
          const c = counterparty as CosmosCounterparty;

          foundVariants.setAsset(c.chainId, address, {
            chainId: c.chainId,
            chainType: "cosmos",
            address: address,
            denom: c.symbol,
            decimals: c.decimals,
            coinGeckoId: squidToken.coingeckoId,
          });
        }
        if (counterparty.chainType === "evm") {
          const c = counterparty as EVMCounterparty;

          foundVariants.setAsset(c.chainId.toString(), address, {
            chainId: c.chainId,
            chainType: "evm",
            address: address,
            denom: c.symbol,
            decimals: c.decimals,
            coinGeckoId: squidToken.coingeckoId,
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
          coinGeckoId: variant.coingeckoId,
        });
      }

      return foundVariants.assets;
    } catch (e) {
      // Avoid returning options if there's an unexpected error, such as the provider being down
      if (process.env.NODE_ENV !== "production") {
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
    const squidFromChain = (await this.getChains()).find(
      ({ chainId }) => String(chainId) === String(fromChain.chainId)
    );

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

  async createCosmosTransaction(
    data: string,
    fromAddress: string,
    toChain: BridgeChain,
    fromCoin: {
      denom: string;
      amount: string;
    },
    /** Gas fee from quote */
    gasFee?: {
      gas: string;
      denom: string;
      amount: string;
    }
  ): Promise<CosmosBridgeTransactionRequest> {
    try {
      const parsedData = JSON.parse(data) as {
        msgTypeUrl: typeof IbcTransferType | typeof WasmTransferType;
      };

      if (parsedData.msgTypeUrl === IbcTransferType) {
        const ibcData = parsedData as {
          msgTypeUrl: typeof IbcTransferType;
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

        // If toChain is not cosmos, this IBC transfer is an
        // intermediary IBC transfer where we need to get the
        // timeout from the bech32 prefix of the receiving address
        const timeoutHeight = await this.ctx.getTimeoutHeight(
          toChain.chainType === "cosmos"
            ? toChain
            : { destinationAddress: ibcData.msg.receiver }
        );

        const { typeUrl, value: msg } = await makeIBCTransferMsg({
          memo: ibcData.msg.memo,
          receiver: ibcData.msg.receiver,
          sender: ibcData.msg.sender,
          sourceChannel: ibcData.msg.sourceChannel,
          sourcePort: ibcData.msg.sourcePort,
          timeoutTimestamp: new Long(
            ibcData.msg.timeoutTimestamp.low,
            ibcData.msg.timeoutTimestamp.high,
            ibcData.msg.timeoutTimestamp.unsigned
          ).toString() as any,
          // @ts-ignore
          timeoutHeight,
          token: ibcData.msg.token,
        });

        return {
          type: "cosmos",
          msgTypeUrl: typeUrl,
          msg,
          gasFee,
        };
      } else if (parsedData.msgTypeUrl === WasmTransferType) {
        const cosmwasmData = parsedData as {
          msgTypeUrl: typeof WasmTransferType;
          msg: {
            wasm: {
              contract: string;
              msg: object;
            };
          };
        };

        const { typeUrl, value: msg } = await makeExecuteCosmwasmContractMsg({
          sender: fromAddress,
          contract: cosmwasmData.msg.wasm.contract,
          msg: Buffer.from(JSON.stringify(cosmwasmData.msg.wasm.msg)),
          funds: [fromCoin],
        });

        return {
          type: "cosmos",
          msgTypeUrl: typeUrl,
          msg,
          gasFee,
        };
      }

      throw new Error(
        "Unknown message type. Osmosis FrontEnd only supports the IBC transfer and cosmwasm executeMsg message type"
      );
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
    const chains = [fromChain?.chainId, toChain?.chainId]
      .filter(Boolean)
      .join(",");
    const tokens = [fromAsset?.address, toAsset?.address]
      .filter(Boolean)
      .join(",");

    if (chains) {
      url.searchParams.set("chains", chains);
    }
    if (tokens) {
      url.searchParams.set("tokens", tokens);
    }

    return { urlProviderName: "Squid", url };
  }
}

export * from "./transfer-status";
