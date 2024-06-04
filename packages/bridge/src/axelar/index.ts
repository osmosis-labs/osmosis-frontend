import type {
  AxelarAssetTransfer,
  AxelarQueryAPI,
} from "@axelar-network/axelarjs-sdk";
import { CoinPretty, Dec } from "@keplr-wallet/unit";
import type { IbcTransferMethod } from "@osmosis-labs/types";
import { getAssetFromAssetList, getKeyByValue } from "@osmosis-labs/utils";
import { cachified } from "cachified";
import {
  Address,
  createPublicClient,
  encodeFunctionData,
  http,
  toHex,
} from "viem";

import { BridgeError, BridgeQuoteError } from "../errors";
import {
  Erc20Abi,
  EthereumChainInfo,
  NativeEVMTokenConstantAddress,
} from "../ethereum";
import {
  BridgeAsset,
  BridgeCoin,
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
import { AxelarSourceChainTokenConfigs } from "./tokens";
import {
  AxelarChainIds_SourceChainMap,
  CosmosChainIds_AxelarChainIds,
} from "./types";

export class AxelarBridgeProvider implements BridgeProvider {
  static readonly ID = "Axelar";
  readonly providerName = AxelarBridgeProvider.ID;

  // initialized via dynamic import
  protected _queryClient: AxelarQueryAPI | null = null;
  protected _assetTransferClient: AxelarAssetTransfer | null = null;

  protected readonly axelarScanBaseUrl: string;
  protected readonly axelarApiBaseUrl: string;

  constructor(protected readonly ctx: BridgeProviderContext) {
    this.axelarScanBaseUrl =
      this.ctx.env === "mainnet"
        ? "https://axelarscan.io"
        : "https://testnet.axelarscan.io";
    this.axelarApiBaseUrl =
      this.ctx.env === "mainnet"
        ? "https://api.axelarscan.io"
        : "https://testnet.api.axelarscan.io";
  }

  async getQuote(params: GetBridgeQuoteParams): Promise<BridgeQuote> {
    const {
      fromAmount,
      fromAsset,
      fromChain,
      fromAddress,
      toAddress,
      toAsset,
      toChain,
      slippage = 1,
    } = params;
    return cachified({
      cache: this.ctx.cache,
      key: JSON.stringify({
        id: AxelarBridgeProvider.ID,
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
              coinMinimalDenom: fromAsset.sourceDenom ?? fromAsset.denom,
            },
            fromAmount
          ).toCoin().amount;

          const fromChainAxelarId = this.getAxelarChainId(fromChain);
          const toChainAxelarId = this.getAxelarChainId(toChain);

          if (!fromChainAxelarId || !toChainAxelarId) {
            throw new BridgeQuoteError([
              {
                errorType: BridgeError.UnsupportedQuoteError,
                message: "Axelar Bridge doesn't support this quote",
              },
            ]);
          }

          const queryClient = await this.getQueryClient();
          const [transferFeeRes, gasCost] = await Promise.all([
            queryClient.getTransferFee(
              fromChainAxelarId,
              toChainAxelarId,
              fromAsset.sourceDenom,
              amount as any
            ),
            this.estimateGasCost(params),
          ]);

          let transferLimitAmount: string | undefined;
          try {
            /** Returns value in denom */
            transferLimitAmount = await queryClient.getTransferLimit({
              denom: fromAsset.sourceDenom,
              fromChainId: fromChainAxelarId.toLowerCase(),
              toChainId: toChainAxelarId.toLowerCase(),
            });
          } catch (e) {
            console.warn("Failed to get transfer limit. reason: ", e);
          }

          if (!transferFeeRes.fee) {
            throw new BridgeQuoteError([
              {
                errorType: BridgeError.UnsupportedQuoteError,
                message: "Axelar Bridge doesn't support this quote",
              },
            ]);
          }

          if (
            transferLimitAmount &&
            new Dec(fromAmount).gte(new Dec(transferLimitAmount))
          ) {
            throw new BridgeQuoteError([
              {
                errorType: BridgeError.UnsupportedQuoteError,
                message: `Amount exceeds transfer limit of ${new CoinPretty(
                  {
                    coinDecimals: fromAsset.decimals,
                    coinDenom: fromAsset.denom,
                    coinMinimalDenom: fromAsset.sourceDenom,
                  },
                  new Dec(transferLimitAmount)
                )
                  .trim(true)
                  .toString()}`,
              },
            ]);
          }

          const transferFeeAsset = getAssetFromAssetList({
            /** Denom from Axelar's `getTransferFee` is the min denom */
            sourceDenom: transferFeeRes.fee.denom,
            assetLists: this.ctx.assetLists,
          });

          const expectedOutputAmount = new Dec(fromAmount).sub(
            new Dec(transferFeeRes.fee.amount)
          );

          return {
            estimatedTime: this.getWaitTime(fromChainAxelarId),
            input: {
              amount: fromAmount,
              sourceDenom: fromAsset.sourceDenom,
              decimals: fromAsset.decimals,
              denom: fromAsset.denom,
            },
            expectedOutput: {
              amount: expectedOutputAmount.toString(),
              sourceDenom: toAsset.sourceDenom,
              decimals: toAsset.decimals,
              denom: toAsset.denom,
              priceImpact: "0",
            },
            fromChain,
            toChain,
            transferFee: {
              amount: transferFeeRes.fee.amount,
              denom:
                transferFeeAsset?.symbol ??
                fromAsset.denom ??
                transferFeeRes.fee.denom,
              sourceDenom: fromAsset.sourceDenom,
              decimals: fromAsset.decimals,
            },
            ...(gasCost && {
              estimatedGasFee: {
                amount: gasCost.amount,
                denom: gasCost.denom,
                sourceDenom: gasCost.sourceDenom,
                decimals: gasCost.decimals,
              },
            }),
          };
        } catch (e) {
          const error = e as
            | { message: string; error: Error }
            | string
            | BridgeQuoteError
            | Error;

          if (error instanceof BridgeQuoteError) {
            throw error;
          }

          if (error instanceof Error) {
            throw new BridgeQuoteError([
              {
                errorType: BridgeError.UnexpectedError,
                message: error.message,
              },
            ]);
          }

          if (typeof error === "string") {
            let errorType = BridgeError.UnexpectedError;
            if (error.includes("not found")) {
              errorType = BridgeError.UnsupportedQuoteError;
            }

            throw new BridgeQuoteError([
              {
                errorType,
                message: error,
              },
            ]);
          }

          throw new BridgeQuoteError([
            {
              errorType: BridgeError.UnexpectedError,
              message: error.message,
            },
          ]);
        }
      },
      ttl: 20 * 1000, // 20 seconds,
    });
  }

  async estimateGasCost(
    params: GetBridgeQuoteParams
  ): Promise<BridgeCoin | undefined> {
    try {
      const transactionData = await this.getTransactionData({
        ...params,
        fromAmount: "0",
        simulated: true,
      });

      if (transactionData.type === "evm") {
        const evmChain = Object.values(EthereumChainInfo).find(
          ({ id: chainId }) =>
            String(chainId) === String(params.fromChain.chainId)
        );

        if (!evmChain) throw new Error("Could not find EVM chain");

        const fromProvider = createPublicClient({
          chain: evmChain,
          transport: http(evmChain.rpcUrls.default.http[0]),
        });

        const gasAmountUsed = String(
          await fromProvider.estimateGas({
            account: params.fromAddress as Address,
            to: transactionData.to,
            value: BigInt(transactionData.value ?? ""),
            data: transactionData.data,
          })
        );

        const gasPrice = (await fromProvider.getGasPrice()).toString();

        const gasCost = new Dec(gasAmountUsed).mul(new Dec(gasPrice));
        return {
          amount: gasCost.truncate().toString(),
          sourceDenom: evmChain.nativeCurrency.symbol,
          decimals: evmChain.nativeCurrency.decimals,
          denom: evmChain.nativeCurrency.symbol,
        };
      }
    } catch (e) {
      console.warn(
        `Failed to estimate gas fees for ${params.fromAsset.denom}:${params.fromChain.chainName} -> ${params.toAsset.denom}:${params.toChain.chainName}. Reason: ${e}`
      );
      return undefined;
    }
  }

  async getTransactionData(
    params: GetBridgeQuoteParams & { simulated?: boolean }
  ): Promise<BridgeTransactionRequest> {
    const { fromChain } = params;
    const isEvmTransaction = fromChain.chainType === "evm";

    if (isEvmTransaction) {
      return await this.createEvmTransaction(params);
    } else {
      return await this.createCosmosTransaction(params);
    }
  }

  async createEvmTransaction({
    fromAsset,
    fromChain,
    toChain,
    toAddress,
    fromAmount,
    simulated,
    fromAddress,
  }: GetBridgeQuoteParams & {
    simulated?: boolean;
  }): Promise<EvmBridgeTransactionRequest> {
    const isNativeToken = this.isNativeAsset(fromAsset);

    if (
      isNativeToken &&
      // is wrapped token
      !Object.values(AxelarSourceChainTokenConfigs(this.ctx.env)).some(
        (chain) => {
          return Object.values(chain).some(
            ({ nativeWrapEquivalent }) =>
              nativeWrapEquivalent &&
              nativeWrapEquivalent.tokenMinDenom === fromAsset.sourceDenom
          );
        }
      )
    ) {
      throw new BridgeQuoteError([
        {
          errorType: BridgeError.CreateEVMTxError,
          message: `${fromAsset.sourceDenom} is not a native token on Axelar`,
        },
      ]);
    }

    const { depositAddress } = simulated
      ? { depositAddress: fromAddress }
      : await this.getDepositAddress({
          fromChain,
          toChain,
          fromAsset,
          toAddress,
        });

    if (isNativeToken) {
      return {
        type: "evm",
        to: depositAddress as Address,
        value: toHex(fromAmount),
      };
    } else {
      return {
        type: "evm",
        to: fromAsset.address as Address, // ERC20 token address
        data: encodeFunctionData({
          abi: Erc20Abi,
          functionName: "transfer",
          args: [depositAddress as `0x${string}`, BigInt(fromAmount)],
        }),
      };
    }
  }

  async createCosmosTransaction({
    fromChain,
    toChain,
    fromAsset,
    fromAddress,
    toAddress,
    toAsset,
    fromAmount,
    simulated,
  }: GetBridgeQuoteParams & {
    simulated?: boolean;
  }): Promise<CosmosBridgeTransactionRequest> {
    const isNativeToken = this.isNativeAsset(toAsset);

    if (
      isNativeToken &&
      // is native token
      Object.values(AxelarSourceChainTokenConfigs(this.ctx.env)).some(
        (chain) => {
          return Object.values(chain).some(
            ({ nativeWrapEquivalent }) =>
              nativeWrapEquivalent &&
              nativeWrapEquivalent.tokenMinDenom === toAsset.sourceDenom
          );
        }
      )
    ) {
      throw new BridgeQuoteError([
        {
          errorType: BridgeError.CreateEVMTxError,
          message: `When withdrawing native ${fromAsset.denom} from Axelar, use the 'autoUnwrapIntoNative' option and not the native minimal denom`,
        },
      ]);
    }

    try {
      const { depositAddress } = simulated
        ? { depositAddress: fromAddress }
        : await this.getDepositAddress({
            fromChain,
            toChain,
            fromAsset,
            toAddress,
            autoUnwrapIntoNative:
              fromChain.chainType === "cosmos" && isNativeToken,
          });

      const timeoutHeight = await this.ctx.getTimeoutHeight({
        destinationAddress: depositAddress,
      });

      const ibcAssetInfo = getAssetFromAssetList({
        assetLists: this.ctx.assetLists,
        sourceDenom: toAsset.sourceDenom,
      });

      if (!ibcAssetInfo) {
        throw new BridgeQuoteError([
          {
            errorType: BridgeError.CreateCosmosTxError,
            message: "Could not find IBC asset info",
          },
        ]);
      }

      const ibcTransferMethod = ibcAssetInfo.rawAsset.transferMethods.find(
        ({ type }) => type === "ibc"
      ) as IbcTransferMethod | undefined;

      if (!ibcTransferMethod) {
        throw new BridgeQuoteError([
          {
            errorType: BridgeError.CreateCosmosTxError,
            message: "Could not find IBC asset transfer info",
          },
        ]);
      }

      const { typeUrl, value: msg } = cosmosMsgOpts.ibcTransfer.messageComposer(
        {
          receiver: depositAddress,
          sender: fromAddress,
          sourceChannel: ibcTransferMethod.chain.channelId,
          sourcePort: "transfer",
          timeoutTimestamp: "0" as any,
          // @ts-ignore
          timeoutHeight,
          token: {
            amount: fromAmount,
            denom: fromAsset.address,
          },
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

  async getDepositAddress({
    fromChain,
    toChain,
    fromAsset,
    toAddress,
    autoUnwrapIntoNative,
  }: GetDepositAddressParams): Promise<BridgeDepositAddress> {
    const fromChainAxelarId = this.getAxelarChainId(fromChain);
    const toChainAxelarId = this.getAxelarChainId(toChain);

    if (!fromChainAxelarId || !toChainAxelarId) {
      throw new Error("Unsupported chain");
    }

    return cachified({
      cache: this.ctx.cache,
      key: `${fromChainAxelarId}/${toChainAxelarId}/${toAddress}/${
        fromAsset.sourceDenom
      }/${Boolean(autoUnwrapIntoNative)}`,
      getFreshValue: async (): Promise<BridgeDepositAddress> => {
        const depositClient = await this.getAssetTransferClient();

        return {
          depositAddress: await depositClient.getDepositAddress({
            fromChain: fromChainAxelarId,
            toChain: toChainAxelarId,
            destinationAddress: toAddress,
            asset: fromAsset.sourceDenom,
            options: autoUnwrapIntoNative
              ? {
                  shouldUnwrapIntoNative: autoUnwrapIntoNative,
                }
              : undefined,
          }),
        };
      },
      ttl: 30 * 60 * 1000, // 30 minutes
    });
  }

  isNativeAsset(asset: BridgeAsset) {
    return asset.address === NativeEVMTokenConstantAddress;
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

  getAxelarChainId(chain: GetBridgeQuoteParams["fromChain"]) {
    if (chain.chainType === "cosmos") {
      return CosmosChainIds_AxelarChainIds(this.ctx.env)[chain.chainId];
    }

    const ethereumChainName = Object.values(EthereumChainInfo).find(
      ({ id: chainId }) => String(chainId) === String(chain.chainId)
    )?.chainName;

    if (!ethereumChainName) return undefined;

    return getKeyByValue(
      AxelarChainIds_SourceChainMap(this.ctx.env),
      ethereumChainName
    );
  }

  async initClients() {
    try {
      const { AxelarQueryAPI, AxelarAssetTransfer, Environment } = await import(
        "@axelar-network/axelarjs-sdk"
      );

      this._queryClient = new AxelarQueryAPI({
        environment:
          this.ctx.env === "mainnet"
            ? Environment.MAINNET
            : Environment.TESTNET,
      });

      this._assetTransferClient = new AxelarAssetTransfer({
        environment:
          this.ctx.env === "mainnet"
            ? Environment.MAINNET
            : Environment.TESTNET,
      });
    } catch (e: any) {
      throw new Error("Failed to init Axelar clients: " + e.message);
    }
  }

  async getQueryClient() {
    if (!this._queryClient) {
      await this.initClients();
    }

    return this._queryClient!;
  }

  async getAssetTransferClient() {
    if (!this._assetTransferClient) {
      await this.initClients();
    }

    return this._assetTransferClient!;
  }
}

export * from "./tokens";
export * from "./transfer-status";
