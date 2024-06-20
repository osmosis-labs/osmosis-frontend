import type {
  AxelarAssetTransfer,
  AxelarQueryAPI,
} from "@axelar-network/axelarjs-sdk";
import { Registry } from "@cosmjs/proto-signing";
import { CoinPretty, Dec } from "@keplr-wallet/unit";
import { ibcProtoRegistry } from "@osmosis-labs/proto-codecs";
import { estimateGasFee } from "@osmosis-labs/tx";
import type { IbcTransferMethod } from "@osmosis-labs/types";
import {
  getAssetFromAssetList,
  getKeyByValue,
  isNil,
} from "@osmosis-labs/utils";
import { cachified } from "cachified";
import {
  Address,
  createPublicClient,
  encodeFunctionData,
  erc20Abi,
  http,
  numberToHex,
} from "viem";

import { BridgeQuoteError } from "../errors";
import { EthereumChainInfo, NativeEVMTokenConstantAddress } from "../ethereum";
import {
  BridgeAsset,
  BridgeChain,
  BridgeCoin,
  BridgeDepositAddress,
  BridgeExternalUrl,
  BridgeProvider,
  BridgeProviderContext,
  BridgeQuote,
  BridgeSupportedAssetsParams,
  BridgeTransactionRequest,
  CosmosBridgeTransactionRequest,
  EvmBridgeTransactionRequest,
  GetBridgeExternalUrlParams,
  GetBridgeQuoteParams,
  GetDepositAddressParams,
} from "../interface";
import { cosmosMsgOpts } from "../msg";
import { BridgeAssetMap } from "../utils";
import { getAxelarAssets, getAxelarChains } from "./queries";
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
  protected protoRegistry = new Registry(ibcProtoRegistry);

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
            throw new BridgeQuoteError({
              errorType: "UnsupportedQuoteError",
              message: "Axelar Bridge doesn't support this quote",
            });
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
            throw new BridgeQuoteError({
              errorType: "UnsupportedQuoteError",
              message: "Axelar Bridge doesn't support this quote",
            });
          }

          if (
            transferLimitAmount &&
            new Dec(fromAmount).gte(new Dec(transferLimitAmount))
          ) {
            throw new BridgeQuoteError({
              errorType: "UnsupportedQuoteError",
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
            });
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
          if (typeof e === "string" && e.includes("not found")) {
            throw new BridgeQuoteError({
              errorType: "UnsupportedQuoteError",
              message: e,
            });
          }

          throw e;
        }
      },
      ttl: 20 * 1000, // 20 seconds,
    });
  }

  async getSupportedAssets({
    chain,
    asset,
  }: BridgeSupportedAssetsParams): Promise<(BridgeChain & BridgeAsset)[]> {
    try {
      // get origin axelar asset info from given toAsset
      const [axelarAssets, axelarChains] = await Promise.all([
        getAxelarAssets({ env: this.ctx.env }),
        getAxelarChains({ env: this.ctx.env }),
      ]);

      // Use of toLowerCase is advised due to registry (Axelar + others) differences
      // in casing of asset addresses. May be somewhat unsafe.

      const axelarSourceAsset = axelarAssets.find(({ addresses }) =>
        Object.keys(addresses).some(
          (address) =>
            addresses[address]?.ibc_denom?.toLowerCase() ===
              asset.address?.toLowerCase() ||
            addresses[address]?.address?.toLowerCase() ===
              asset.address?.toLowerCase()
        )
      );

      if (!axelarSourceAsset)
        throw new Error(
          "Axelar source asset not found given asset address: " + asset.address
        );

      // make sure to chain and to asset align (validation)
      const axelarChainId = this.getAxelarChainId(chain);
      if (!axelarChainId)
        throw new Error("Axelar chain not ID found: " + chain.chainId);
      const axelarAssetAddress = axelarSourceAsset.addresses[axelarChainId];
      if (
        !axelarAssetAddress ||
        (asset.address.toLowerCase() !==
          axelarAssetAddress.ibc_denom?.toLowerCase() &&
          asset.address.toLowerCase() !==
            axelarAssetAddress.address?.toLowerCase())
      )
        throw new Error(
          "Axelar asset address not found, axelarChainId: " + axelarChainId
        );

      const foundVariants = new BridgeAssetMap<BridgeChain & BridgeAsset>();

      // return just origin asset and the unwrapped version for now, but
      // can return other axl-versions later if wanted
      const nativeChainAsset =
        axelarSourceAsset.addresses[axelarSourceAsset.native_chain];
      if (!nativeChainAsset)
        throw new Error(
          "Native chain asset not found, asset native_chain: " +
            axelarSourceAsset.native_chain
        );

      const sourceAssetId =
        nativeChainAsset?.address ?? nativeChainAsset?.ibc_denom;
      if (!sourceAssetId)
        throw new Error(
          "Source asset ID not found, native chain asset ID: " +
            nativeChainAsset?.address ?? nativeChainAsset?.ibc_denom
        );

      const axelarChain = axelarChains.find(
        (chain) => chain.maintainer_id === axelarSourceAsset.native_chain
      );

      if (!axelarChain)
        throw new Error(
          "Axelar chain not found, asset native_chain: " +
            axelarSourceAsset.native_chain
        );

      // axelar chain list IDs are canonical
      const chainInfo =
        axelarChain.chain_type === "evm"
          ? {
              chainId: axelarChain.chain_id as number,
              chainType: axelarChain.chain_type,
            }
          : {
              chainId: axelarChain.chain_id as string,
              chainType: axelarChain.chain_type,
            };

      foundVariants.setAsset(
        axelarChain.chain_id.toString(),
        axelarSourceAsset.denom,
        {
          ...chainInfo,
          chainName: axelarChain.chain_name,
          denom: nativeChainAsset.symbol,
          address: sourceAssetId,
          decimals: axelarSourceAsset.decimals,
          sourceDenom: sourceAssetId,
        }
      );

      // there are auto-un/wrapped versions
      if (axelarSourceAsset.denoms) {
        // assume it's the chain native asset
        const unwrappedDenom = axelarSourceAsset.denoms[1];

        if (!unwrappedDenom) return foundVariants.assets;

        const axelarChain = axelarChains.find(
          (chain) => chain.maintainer_id === axelarSourceAsset.native_chain
        );

        if (!axelarChain) return foundVariants.assets;
        // only handle unwrapping with evm chains due to ERC20 standard & EVM account model
        if (axelarChain.chain_type !== "evm") return foundVariants.assets;

        foundVariants.setAsset(
          axelarChain.chain_id.toString(),
          NativeEVMTokenConstantAddress,
          {
            // axelar chain list IDs are canonical
            chainId: axelarChain.chain_id as number,
            chainType: axelarChain.chain_type,
            chainName: axelarChain.chain_name,
            denom: axelarChain.native_token.symbol,
            address: unwrappedDenom,
            decimals: axelarChain.native_token.decimals,
            sourceDenom: NativeEVMTokenConstantAddress,
          }
        );
      }

      return foundVariants.assets;
    } catch (e) {
      // Avoid returning options if there's an unexpected error, such as the provider being down
      console.error(
        AxelarBridgeProvider.ID,
        "failed to get supported assets:",
        e
      );
      return [];
    }
  }

  async estimateGasCost(
    params: GetBridgeQuoteParams
  ): Promise<BridgeCoin | undefined> {
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

    if (transactionData.type === "cosmos") {
      const txSimulation = await estimateGasFee({
        chainId: params.fromChain.chainId.toString(),
        chainList: this.ctx.chainList,
        body: {
          messages: [
            this.protoRegistry.encodeAsAny({
              typeUrl: transactionData.msgTypeUrl,
              value: transactionData.msg,
            }),
          ],
        },
        bech32Address: params.fromAddress,
      });

      const gasFee = txSimulation.amount[0];
      const gasAsset = this.ctx.assetLists
        .flatMap((list) => list.assets)
        .find((asset) => asset.coinMinimalDenom === gasFee.denom);

      return {
        amount: gasFee.amount,
        denom: gasAsset?.symbol ?? gasFee.denom,
        decimals: gasAsset?.decimals ?? 0,
        sourceDenom: gasAsset?.coinMinimalDenom ?? gasFee.denom,
      };
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
      throw new BridgeQuoteError({
        errorType: "CreateEVMTxError",
        message: `${fromAsset.sourceDenom} is not a native token on Axelar`,
      });
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
        value: numberToHex(BigInt(fromAmount)),
      };
    } else {
      return {
        type: "evm",
        to: fromAsset.address as Address, // ERC20 token address
        data: encodeFunctionData({
          abi: erc20Abi,
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
      throw new BridgeQuoteError({
        errorType: "CreateEVMTxError",
        message: `When withdrawing native ${fromAsset.denom} from Axelar, use the 'autoUnwrapIntoNative' option and not the native minimal denom`,
      });
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

      const ibcAsset = getAssetFromAssetList({
        assetLists: this.ctx.assetLists,
        coinMinimalDenom: fromAsset.address,
      });

      if (!ibcAsset) {
        throw new BridgeQuoteError({
          errorType: "CreateCosmosTxError",
          message: "Could not find IBC asset info",
        });
      }

      const ibcTransferMethod = ibcAsset.rawAsset.transferMethods.find(
        ({ type }) => type === "ibc"
      ) as IbcTransferMethod | undefined;

      if (!ibcTransferMethod) {
        throw new BridgeQuoteError({
          errorType: "CreateCosmosTxError",
          message: "Could not find IBC asset transfer info",
        });
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
        throw new BridgeQuoteError({
          errorType: "CreateCosmosTxError",
          message: error.message,
        });
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
      throw new Error(
        `Unsupported chain: Chain ID ${
          !fromChainAxelarId ? fromChain.chainId : toChain.chainId
        } is not supported.`
      );
    }

    return cachified({
      cache: this.ctx.cache,
      key: `${
        AxelarBridgeProvider.ID
      }${fromChainAxelarId}_${toChainAxelarId}/${toAddress}/${
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

  async getExternalUrl({
    fromChain,
    toChain,
    toAsset,
    toAddress,
    fromAsset,
  }: GetBridgeExternalUrlParams): Promise<BridgeExternalUrl | undefined> {
    const [axelarChains, axelarAssets] = await Promise.all([
      getAxelarChains({ env: this.ctx.env }),
      getAxelarAssets({ env: this.ctx.env }),
    ]);

    const fromAxelarChain = axelarChains.find(
      (chain) => String(chain.chain_id) === String(fromChain.chainId)
    );

    if (!fromAxelarChain) {
      throw new Error(`Chain not found: ${fromChain.chainId}`);
    }

    const toAxelarChain = axelarChains.find(
      (chain) => String(chain.chain_id) === String(toChain.chainId)
    );

    if (!toAxelarChain) {
      throw new Error(`Chain not found: ${toChain.chainId}`);
    }

    const fromAxelarAsset = axelarAssets.find((axelarAsset) => {
      const asset = axelarAsset.addresses[toAxelarChain.chain_name];
      if (isNil(asset)) return false;

      const ibcDenomMatches =
        asset.ibc_denom?.toLowerCase() === toAsset.address?.toLowerCase();
      const addressMatches =
        asset.address?.toLowerCase() === toAsset.address?.toLowerCase();

      return ibcDenomMatches || addressMatches;
    });

    if (!fromAxelarAsset) {
      throw new Error(`Asset not found: ${toAsset.address}`);
    }

    const url = new URL(
      this.ctx.env === "mainnet"
        ? "https://satellite.money/"
        : "https://testnet.satellite.money/"
    );
    url.searchParams.set("source", fromAxelarChain.chain_name);
    url.searchParams.set("destination", toAxelarChain.chain_name);
    url.searchParams.set(
      "asset_denom",
      // Check if the asset has multiple denoms (indicating wrapped tokens)
      !isNil(fromAxelarAsset.denoms) && fromAxelarAsset.denoms.length > 1
        ? // If the fromAsset address is the native EVM token constant address, use the second denom which is the unwrapped token
          fromAsset.address === NativeEVMTokenConstantAddress
          ? fromAxelarAsset.denoms[1]
          : fromAxelarAsset.denoms[0]
        : // If there are no multiple denoms, use the default denom
          fromAxelarAsset.denom
    );
    url.searchParams.set("destination_address", toAddress);

    return { urlProviderName: "Skip", url };
  }
}

export * from "./tokens";
export * from "./transfer-status";
