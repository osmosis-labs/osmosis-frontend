import type {
  AxelarAssetTransfer,
  AxelarQueryAPI,
} from "@axelar-network/axelarjs-sdk";
import { CoinPretty, Dec } from "@keplr-wallet/unit";
import { cosmosMsgOpts } from "@osmosis-labs/stores";
import {
  getAssetFromAssetList,
  getChain,
  getChannelInfoFromAsset,
} from "@osmosis-labs/utils";
import { cachified } from "cachified";
import { ethers } from "ethers";
import { hexToNumberString, toHex } from "web3-utils";

import { AssetLists } from "~/config/generated/asset-lists";
import { ChainList } from "~/config/generated/chain-list";
import { EthereumChainInfo } from "~/integrations/bridge-info";
import {
  Erc20Abi,
  NativeEVMTokenConstantAddress,
} from "~/integrations/ethereum";
import { getAssetPrice } from "~/server/queries/complex/assets/price";
import { getTimeoutHeight } from "~/server/queries/complex/get-timeout-height";
import { ErrorTypes } from "~/utils/error-types";
import { getKeyByValue } from "~/utils/object";

import { BridgeQuoteError } from "../errors";
import {
  BridgeAsset,
  BridgeCoin,
  BridgeDepositAddress,
  BridgeProvider,
  BridgeProviderContext,
  BridgeQuote,
  BridgeTransactionRequest,
  BridgeTransferStatus,
  CosmosBridgeTransactionRequest,
  EvmBridgeTransactionRequest,
  GetBridgeQuoteParams,
  GetDepositAddressParams,
} from "../types";
import { AxelarSourceChainTokenConfigs } from "./axelar-source-chain-token-config";
import { getTransferStatus } from "./queries";
import {
  AxelarChainIds_SourceChainMap,
  CosmosChainIds_AxelarChainIds,
} from "./types";

const providerName = "Axelar" as const;
export class AxelarBridgeProvider implements BridgeProvider {
  static providerName = providerName;
  providerName = providerName;
  logoUrl = `${process.env.NEXT_PUBLIC_BASEPATH}/bridges/axelar.svg`;

  private _queryClient: AxelarQueryAPI | null = null;
  private _assetTransferClient: AxelarAssetTransfer | null = null;

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
              coinMinimalDenom: fromAsset.sourceDenom ?? fromAsset.denom,
            },
            fromAmount
          ).toCoin().amount;

          const fromChainAxelarId = this.getAxelarChainId(fromChain);
          const toChainAxelarId = this.getAxelarChainId(toChain);

          if (!fromChainAxelarId || !toChainAxelarId) {
            throw new BridgeQuoteError([
              {
                errorType: ErrorTypes.UnsupportedQuoteError,
                message: "Axelar Bridge doesn't support this quote",
              },
            ]);
          }

          const queryClient = await this.getQueryClient();
          const transferFeeRes = await queryClient.getTransferFee(
            fromChainAxelarId,
            toChainAxelarId,
            fromAsset.sourceDenom,
            amount as any
          );

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

          const gasCost = await this.estimateGasCost(params);

          if (!transferFeeRes.fee) {
            throw new BridgeQuoteError([
              {
                errorType: ErrorTypes.UnsupportedQuoteError,
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
                errorType: ErrorTypes.UnsupportedQuoteError,
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
            assetLists: AssetLists,
          });

          const currency = "usd";

          let transferFeeFiatValue: Dec | undefined;
          try {
            transferFeeFiatValue = await getAssetPrice({
              asset: {
                coinDenom: fromAsset.denom,
                sourceDenom: transferFeeRes.fee.denom,
              },
              currency,
            });
          } catch (e) {
            console.error(`Failed to get ${transferFeeRes.fee.denom} price`);
          }

          let gasCostFiatValue: Dec | undefined;
          try {
            gasCostFiatValue = await getAssetPrice({
              asset: {
                coinDenom: fromAsset.denom,
                sourceDenom: gasCost?.sourceDenom ?? "",
              },
              currency,
            });
          } catch (e) {
            console.error(`Failed to get ${gasCost?.sourceDenom} price`);
          }

          const expectedOutputAssetFiatValue = await getAssetPrice({
            asset: {
              coinDenom: toAsset.denom,
              sourceDenom: toAsset.sourceDenom ?? "",
            },
            currency,
          });

          if (!expectedOutputAssetFiatValue) {
            throw new Error(
              `Failed to get expectedOutput ${toAsset.denom} price`
            );
          }

          const inputAssetFiatValue = await getAssetPrice({
            asset: {
              coinDenom: toAsset.denom,
              sourceDenom: toAsset.sourceDenom ?? "",
            },
            currency,
          });

          if (!inputAssetFiatValue) {
            throw new Error(`Failed to get input ${fromAsset.denom} price`);
          }

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
              fiatValue: {
                currency: "usd",
                amount: new CoinPretty(
                  {
                    coinDecimals: fromAsset.decimals,
                    coinDenom: fromAsset.denom,
                    coinMinimalDenom: fromAsset.sourceDenom,
                  },
                  fromAmount
                )
                  .mul(inputAssetFiatValue)
                  .toDec()
                  .toString(),
              },
            },
            expectedOutput: {
              amount: expectedOutputAmount.toString(),
              sourceDenom: toAsset.sourceDenom,
              decimals: toAsset.decimals,
              denom: toAsset.denom,
              priceImpact: "0",
              fiatValue: {
                currency,
                amount: new CoinPretty(
                  {
                    coinDecimals: toAsset.decimals,
                    coinDenom: toAsset.denom,
                    coinMinimalDenom: toAsset.sourceDenom,
                  },
                  expectedOutputAmount.toString()
                )
                  .mul(expectedOutputAssetFiatValue)
                  .toDec()
                  .toString(),
              },
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
              ...(transferFeeFiatValue && {
                fiatValue: {
                  currency,
                  amount: new CoinPretty(
                    {
                      coinDecimals: fromAsset.decimals,
                      coinDenom: fromAsset.denom,
                      coinMinimalDenom: fromAsset.sourceDenom,
                    },
                    transferFeeRes.fee.amount
                  )
                    .mul(transferFeeFiatValue)
                    .toDec()
                    .toString(),
                },
              }),
            },
            ...(gasCost && {
              estimatedGasFee: {
                amount: gasCost.amount,
                denom: gasCost.denom,
                sourceDenom: gasCost.sourceDenom,
                decimals: gasCost.decimals,
                ...(gasCostFiatValue && {
                  fiatValue: {
                    currency,
                    amount: new CoinPretty(
                      {
                        coinDecimals: gasCost.decimals,
                        coinDenom: gasCost.denom,
                        coinMinimalDenom: gasCost.sourceDenom,
                      },
                      gasCost?.amount
                    )
                      .mul(gasCostFiatValue)
                      .toDec()
                      .toString(),
                  },
                }),
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
                errorType: ErrorTypes.UnexpectedError,
                message: error.message,
              },
            ]);
          }

          if (typeof error === "string") {
            let errorType = ErrorTypes.UnexpectedError;
            if (error.includes("not found")) {
              errorType = ErrorTypes.UnsupportedQuoteError;
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
              errorType: ErrorTypes.UnexpectedError,
              message: error.message,
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

    const transferStatus = await getTransferStatus(
      sendTxHash,
      this.axelarApiBaseUrl
    );

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
          ({ chainId }) => chainId === params.fromChain.chainId
        );

        if (!evmChain) throw new Error("Could not find EVM chain");

        const fromProvider = new ethers.JsonRpcProvider(evmChain.rpcUrls[0]);

        const gasAmountUsed = String(
          await fromProvider.estimateGas({
            from: params.fromAddress,
            to: transactionData.to,
            value: transactionData.value,
            data: transactionData.data,
          })
        );
        const gasPrice = hexToNumberString(
          await fromProvider._perform({
            method: "getGasPrice",
          })
        );

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
      !Object.values(AxelarSourceChainTokenConfigs).some((chain) => {
        return Object.values(chain).some(
          ({ nativeWrapEquivalent }) =>
            nativeWrapEquivalent &&
            nativeWrapEquivalent.tokenMinDenom === fromAsset.sourceDenom
        );
      })
    ) {
      throw new BridgeQuoteError([
        {
          errorType: ErrorTypes.CreateEVMTxError,
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
        to: depositAddress,
        value: toHex(fromAmount),
      };
    } else {
      return {
        type: "evm",
        to: fromAsset.address, // ERC20 token address
        data: Erc20Abi.encodeFunctionData("transfer", [
          depositAddress,
          toHex(fromAmount),
        ]),
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
      Object.values(AxelarSourceChainTokenConfigs).some((chain) => {
        return Object.values(chain).some(
          ({ nativeWrapEquivalent }) =>
            nativeWrapEquivalent &&
            nativeWrapEquivalent.tokenMinDenom === toAsset.sourceDenom
        );
      })
    ) {
      throw new BridgeQuoteError([
        {
          errorType: ErrorTypes.CreateEVMTxError,
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

      const timeoutHeight = await getTimeoutHeight({
        destinationAddress: depositAddress,
      });

      const ibcAssetInfo = getAssetFromAssetList({
        assetLists: AssetLists,
        sourceDenom: toAsset.sourceDenom,
      });

      if (!ibcAssetInfo) {
        throw new BridgeQuoteError([
          {
            errorType: ErrorTypes.CreateCosmosTxError,
            message: "Could not find IBC asset info",
          },
        ]);
      }

      const { typeUrl, value: msg } = cosmosMsgOpts.ibcTransfer.messageComposer(
        {
          receiver: depositAddress,
          sender: fromAddress,
          sourceChannel: getChannelInfoFromAsset(ibcAssetInfo.rawAsset)
            .sourceChannelId,
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
            errorType: ErrorTypes.CreateCosmosTxError,
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

  isNativeAsset(fromAsset: BridgeAsset) {
    return fromAsset.address === NativeEVMTokenConstantAddress;
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
      const chainId = getChain({
        chainList: ChainList,
        chainId: chain.chainId as string,
      })?.chain_id;

      if (!chainId) return undefined;

      return CosmosChainIds_AxelarChainIds[chainId];
    }

    const ethereumChainName = Object.values(EthereumChainInfo).find(
      ({ chainId }) => chainId === chain.chainId
    )?.chainName;

    if (!ethereumChainName) return undefined;

    return getKeyByValue(AxelarChainIds_SourceChainMap, ethereumChainName);
  }

  async initClients() {
    try {
      const [queryClientClass, assetTransferClientClass, Environment] =
        await import("@axelar-network/axelarjs-sdk").then(
          (m) =>
            [m.AxelarQueryAPI, m.AxelarAssetTransfer, m.Environment] as const
        );

      this._queryClient = new queryClientClass({
        environment:
          this.ctx.env === "mainnet"
            ? Environment.MAINNET
            : Environment.TESTNET,
      });
      this._assetTransferClient = new assetTransferClientClass({
        environment:
          this.ctx.env === "mainnet"
            ? Environment.MAINNET
            : Environment.TESTNET,
      });
    } catch (e) {
      console.error("Failed to init Axelar clients. Reason: ", e);
      throw new Error("Failed to init Axelar clients");
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
