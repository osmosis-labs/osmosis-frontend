import type {
  AxelarAssetTransfer,
  AxelarQueryAPI,
} from "@axelar-network/axelarjs-sdk";
import { Registry } from "@cosmjs/proto-signing";
import { CoinPretty, Dec, IntPretty } from "@keplr-wallet/unit";
import { ibcProtoRegistry } from "@osmosis-labs/proto-codecs";
import { cosmosMsgOpts, estimateGasFee } from "@osmosis-labs/tx";
import type { IbcTransferMethod } from "@osmosis-labs/types";
import {
  EthereumChainInfo,
  getAssetFromAssetList,
  NativeEVMTokenConstantAddress,
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
import {
  BridgeAsset,
  BridgeChain,
  BridgeCoin,
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
import { getAxelarAssets, getAxelarChains } from "./queries";

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
      ttl: process.env.NODE_ENV === "test" ? -1 : 20 * 1000, // 20 seconds
      getFreshValue: async (): Promise<BridgeQuote> => {
        try {
          const [fromChainAxelarId, toChainAxelarId, fromAssetAxelarId] =
            await Promise.all([
              this.getAxelarChainId(fromChain),
              this.getAxelarChainId(toChain),
              this.getAxelarAssetId(fromChain, fromAsset),
            ]);

          if (!fromChainAxelarId || !toChainAxelarId) {
            throw new BridgeQuoteError({
              bridgeId: AxelarBridgeProvider.ID,
              errorType: "UnsupportedQuoteError",
              message: "Axelar Bridge doesn't support this quote",
            });
          }

          const queryClient = await this.getQueryClient();
          const [transferFeeRes, estimatedGasFee] = await Promise.all([
            queryClient.getTransferFee(
              fromChainAxelarId,
              toChainAxelarId,
              fromAssetAxelarId,
              fromAmount as any
            ),
            this.estimateGasCost(params),
          ]).catch((e) => {
            throw new BridgeQuoteError({
              bridgeId: AxelarBridgeProvider.ID,
              errorType: "UnsupportedQuoteError",
              message:
                "Axelar Bridge doesn't support this quote:" + e.toString(),
            });
          });

          let transferLimitAmount: string | undefined;
          try {
            /** Returns value in denom */
            transferLimitAmount = await queryClient.getTransferLimit({
              denom: fromAssetAxelarId,
              fromChainId: fromChainAxelarId,
              toChainId: toChainAxelarId,
            });
          } catch (e) {
            console.warn("Failed to get transfer limit. reason: ", e);
          }

          if (!transferFeeRes.fee) {
            throw new BridgeQuoteError({
              bridgeId: AxelarBridgeProvider.ID,
              errorType: "UnsupportedQuoteError",
              message: "Axelar Bridge doesn't support this quote",
            });
          }

          if (
            transferLimitAmount &&
            new Dec(fromAmount).gte(new Dec(transferLimitAmount))
          ) {
            throw new BridgeQuoteError({
              bridgeId: AxelarBridgeProvider.ID,
              errorType: "UnsupportedQuoteError",
              message: `Amount exceeds transfer limit of ${new CoinPretty(
                {
                  coinDecimals: fromAsset.decimals,
                  coinDenom: fromAsset.denom,
                  coinMinimalDenom: fromAsset.address,
                },
                new Dec(transferLimitAmount)
              )
                .trim(true)
                .toString()}`,
            });
          }

          const expectedOutputAmount = new Dec(fromAmount).sub(
            new Dec(transferFeeRes.fee.amount)
          );

          if (
            expectedOutputAmount.isZero() ||
            expectedOutputAmount.isNegative()
          ) {
            throw new BridgeQuoteError({
              bridgeId: AxelarBridgeProvider.ID,
              errorType: "InsufficientAmountError",
              message: `Negative output amount ${new IntPretty(
                expectedOutputAmount
              ).trim(true)} for asset in: ${new IntPretty(fromAmount).trim(
                true
              )} ${fromAsset.denom}`,
            });
          }

          return {
            estimatedTime: this.getWaitTime(fromChainAxelarId),
            input: {
              ...fromAsset,
              amount: fromAmount,
            },
            expectedOutput: {
              ...toAsset,
              amount: expectedOutputAmount.toString(),
              priceImpact: "0",
            },
            fromChain,
            toChain,
            transferFee: {
              ...fromAsset,
              amount: transferFeeRes.fee.amount,
              chainId: fromChain.chainId,
              denom: fromAsset.denom ?? transferFeeRes.fee.denom,
            },
            estimatedGasFee,
            // Note: transactionRequest is missing here because deposit addresses can take 10+ seconds to generate
          };
        } catch (e) {
          if (typeof e === "string" && e.includes("not found")) {
            throw new BridgeQuoteError({
              bridgeId: AxelarBridgeProvider.ID,
              errorType: "UnsupportedQuoteError",
              message: e,
            });
          }

          throw e;
        }
      },
    });
  }

  async getSupportedAssets({
    chain,
    asset,
  }: GetBridgeSupportedAssetsParams): Promise<(BridgeChain & BridgeAsset)[]> {
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
            (addresses[address]?.ibc_denom &&
              addresses[address]!.ibc_denom!.toLowerCase() ===
                asset.address.toLowerCase()) ||
            (addresses[address]?.address &&
              addresses[address]!.address!.toLowerCase() ===
                asset.address.toLowerCase())
        )
      );

      if (!axelarSourceAsset)
        throw new Error(
          "Axelar source asset not found given asset address: " + asset.address
        );

      // make sure given chain and asset align (validation)
      // validate chain
      const axelarChainId = await this.getAxelarChainId(chain);
      const axelarChainAssetAddress =
        axelarSourceAsset.addresses[axelarChainId];
      if (
        !axelarChainAssetAddress ||
        // validate asset
        (asset.address.toLowerCase() !==
          axelarChainAssetAddress.ibc_denom?.toLowerCase() &&
          asset.address.toLowerCase() !==
            axelarChainAssetAddress.address?.toLowerCase())
      )
        throw new Error(
          "Chain and asset combo not recognized by Axelar asset & chain list, axelarChainId: " +
            axelarChainId
        );

      const foundVariants = new BridgeAssetMap<BridgeChain & BridgeAsset>();

      // return just origin asset and the unwrapped version for now, but
      // can return other axl-versions later if wanted
      const addressAsset =
        axelarSourceAsset.addresses[axelarSourceAsset.native_chain];
      if (!addressAsset)
        throw new Error(
          "Native chain asset not found, asset native_chain: " +
            axelarSourceAsset.native_chain
        );

      const assetAddress = addressAsset?.address ?? addressAsset?.ibc_denom;
      if (!assetAddress)
        throw new Error(
          "Source asset ID not found, native chain asset ID: " +
            addressAsset?.address ?? addressAsset?.ibc_denom
        );

      const axelarChain = axelarChains.find(
        (chain) => chain.id.toLowerCase() === axelarSourceAsset.native_chain
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

      if (chain.chainId === axelarChain.chain_id.toString()) return [];

      foundVariants.setAsset(
        axelarChain.chain_id.toString(),
        axelarSourceAsset.denom,
        {
          ...chainInfo,
          chainName: axelarChain.name,
          denom: addressAsset.symbol,
          address: assetAddress,
          decimals: axelarSourceAsset.decimals,
          coinGeckoId: axelarSourceAsset.coingecko_id,
        }
      );

      // there are auto-un/wrapped versions for EVM
      if (axelarSourceAsset.denoms) {
        // assume it's the chain native asset
        const unwrappedDenom = axelarSourceAsset.denoms[1];

        if (!unwrappedDenom) return foundVariants.assets;

        // only handle unwrapping with evm chains due to ERC20 standard & EVM account model
        if (axelarChain.chain_type !== "evm") return foundVariants.assets;

        foundVariants.setAsset(
          axelarChain.chain_id.toString(),
          NativeEVMTokenConstantAddress,
          {
            // axelar chain list IDs are canonical
            chainId: axelarChain.chain_id as number,
            chainType: axelarChain.chain_type,
            chainName: axelarChain.name,
            denom: axelarChain.native_token.symbol,
            address: NativeEVMTokenConstantAddress,
            decimals: axelarChain.native_token.decimals,
            coinGeckoId: axelarSourceAsset.coingecko_id,
          }
        );
      }

      return foundVariants.assets;
    } catch (e) {
      // Avoid returning options if there's an unexpected error, such as the provider being down
      if (process.env.NODE_ENV !== "production") {
        console.error(
          AxelarBridgeProvider.ID,
          "failed to get supported assets:",
          e
        );
      }
      return [];
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
      const transaction = await this.createCosmosTransaction(params);
      const gasFee = await this.estimateCosmosTxGasCost(params, transaction);

      return {
        ...transaction,
        gasFee:
          gasFee && gasFee.gas
            ? {
                amount: gasFee.amount,
                denom: gasFee.address,
                gas: gasFee.gas,
              }
            : undefined,
      };
    }
  }

  async estimateGasCost(
    params: GetBridgeQuoteParams
  ): Promise<(BridgeCoin & { gas?: string }) | undefined> {
    const transactionData = await this.getTransactionData({
      ...params,
      fromAmount: "0",
      simulated: true,
    });

    if (transactionData.type === "cosmos") {
      return this.estimateCosmosTxGasCost(params, transactionData);
    } else if (transactionData.type === "evm") {
      return this.estimateEvmTxGasCost(params, transactionData);
    }
  }

  async estimateCosmosTxGasCost(
    params: GetBridgeQuoteParams,
    transactionData: CosmosBridgeTransactionRequest
  ) {
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
    }).catch((e) => {
      if (
        e instanceof Error &&
        e.message.includes(
          "No fee tokens found with sufficient balance on account"
        )
      ) {
        throw new BridgeQuoteError({
          bridgeId: AxelarBridgeProvider.ID,
          errorType: "InsufficientAmountError",
          message: e.message,
        });
      }

      throw e;
    });

    const gasFee = txSimulation.amount[0];
    const gasAsset = this.ctx.assetLists
      .flatMap((list) => list.assets)
      .find(
        (asset) =>
          asset.coinMinimalDenom === gasFee.denom ||
          asset.counterparty.some(
            (c) =>
              "chainId" in c &&
              c.chainId === params.fromChain.chainId &&
              c.sourceDenom === gasFee.denom
          )
      );

    return {
      amount: gasFee.amount,
      denom: gasAsset?.symbol ?? gasFee.denom,
      decimals: gasAsset?.decimals ?? 0,
      address: gasAsset?.coinMinimalDenom ?? gasFee.denom,
      coinGeckoId: gasAsset?.coingeckoId,
      gas: txSimulation.gas,
    };
  }

  async estimateEvmTxGasCost(
    params: GetBridgeQuoteParams,
    transactionData: EvmBridgeTransactionRequest
  ) {
    const evmChain = Object.values(EthereumChainInfo).find(
      ({ id: chainId }) => String(chainId) === String(params.fromChain.chainId)
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
        value: transactionData.value
          ? BigInt(transactionData.value)
          : undefined,
        data: transactionData.data,
      })
    );

    const gasPrice = (await fromProvider.getGasPrice()).toString();

    const gasCost = new Dec(gasAmountUsed).mul(new Dec(gasPrice));
    return {
      amount: gasCost.truncate().toString(),
      address: NativeEVMTokenConstantAddress,
      decimals: evmChain.nativeCurrency.decimals,
      denom: evmChain.nativeCurrency.symbol,
    };
  }

  async createEvmTransaction({
    fromAsset,
    fromChain,
    toChain,
    toAsset,
    toAddress,
    fromAmount,
    simulated,
    fromAddress,
  }: GetBridgeQuoteParams & {
    simulated?: boolean;
  }): Promise<EvmBridgeTransactionRequest> {
    const { depositAddress } = simulated
      ? { depositAddress: fromAddress }
      : await this.getDepositAddress({
          fromChain,
          toChain,
          fromAsset,
          toAsset,
          toAddress,
        });

    if (this.isNativeEvmToken(fromAsset)) {
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
          args: [depositAddress as Address, BigInt(fromAmount)],
        }),
      };
    }
  }

  async createCosmosTransaction({
    fromChain,
    toChain,
    fromAsset,
    toAsset,
    fromAddress,
    toAddress,
    fromAmount,
    simulated,
  }: GetBridgeQuoteParams & {
    simulated?: boolean;
  }): Promise<CosmosBridgeTransactionRequest> {
    try {
      const { depositAddress } = simulated
        ? { depositAddress: fromAddress }
        : await this.getDepositAddress({
            fromChain,
            toChain,
            fromAsset,
            toAsset,
            toAddress,
          });

      const timeoutHeight = await this.ctx.getTimeoutHeight({
        destinationAddress: depositAddress,
      });

      const ibcAsset = getAssetFromAssetList({
        assetLists: this.ctx.assetLists,
        // Explicitly check against coinMinimalDenom
        coinMinimalDenom: fromAsset.address,
      });

      if (!ibcAsset) {
        throw new BridgeQuoteError({
          bridgeId: AxelarBridgeProvider.ID,
          errorType: "CreateCosmosTxError",
          message: "Could not find IBC asset info",
        });
      }

      const ibcTransferMethod = ibcAsset.rawAsset.transferMethods.find(
        ({ type }) => type === "ibc"
      ) as IbcTransferMethod | undefined;

      if (!ibcTransferMethod) {
        throw new BridgeQuoteError({
          bridgeId: AxelarBridgeProvider.ID,
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
          bridgeId: AxelarBridgeProvider.ID,
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
    toAsset,
    toAddress,
  }: GetDepositAddressParams): Promise<BridgeDepositAddress> {
    const fromChainAxelarId = await this.getAxelarChainId(fromChain);
    const toChainAxelarId = await this.getAxelarChainId(toChain);
    const autoUnwrapIntoNative =
      fromChain.chainType === "cosmos" && this.isNativeEvmToken(toAsset);

    return cachified({
      cache: this.ctx.cache,
      key: `${
        AxelarBridgeProvider.ID
      }${fromChainAxelarId}_${toChainAxelarId}/${toAddress}/${
        fromAsset.address
      }/${Boolean(autoUnwrapIntoNative)}`,
      ttl: process.env.NODE_ENV === "test" ? -1 : 30 * 60 * 1000, // 30 minutes
      getFreshValue: async (): Promise<BridgeDepositAddress> => {
        const [depositClient, toAssetAxelarId] = await Promise.all([
          this.getAssetTransferClient(),
          this.getAxelarAssetId(fromChain, fromAsset),
        ]);

        return {
          depositAddress: await depositClient.getDepositAddress({
            fromChain: fromChainAxelarId,
            toChain: toChainAxelarId,
            destinationAddress: toAddress,
            asset: toAssetAxelarId,
            options: autoUnwrapIntoNative
              ? {
                  shouldUnwrapIntoNative: autoUnwrapIntoNative,
                }
              : undefined,
          }),
        };
      },
    });
  }

  isNativeEvmToken(asset: BridgeAsset) {
    return asset.address === NativeEVMTokenConstantAddress;
  }

  getWaitTime(axelarChainId: string) {
    switch (axelarChainId) {
      case "ethereum":
      case "polygon":
        return 900;
      default:
        return 180;
    }
  }

  /**
   * Returns asset ID (denom) considered canonical by Axelar and its APIs.
   * @throws if not found in Axelar chain or asset list.
   */
  async getAxelarAssetId(
    chain: BridgeChain,
    asset: BridgeAsset
  ): Promise<string> {
    const axelarAssets = await getAxelarAssets({ env: this.ctx.env });

    // Use chain ID and find axelar asset ID from asset's denoms list
    // Only applicable to native EVM assets
    if (this.isNativeEvmToken(asset)) {
      const axelarChains = await getAxelarChains({ env: this.ctx.env });

      const axelarChain = axelarChains.find(
        ({ chain_id }) => chain_id === chain.chainId
      );
      if (!axelarChain) {
        throw new Error("Chain not found");
      }

      // Use chain ID and find axelar asset ID from denoms list
      const axelarNativeEvmAsset = axelarAssets.find(
        ({ native_chain, denoms }) =>
          native_chain === axelarChain.id &&
          // The second denom matches the native gas token denom as a lowercase symbol
          denoms &&
          denoms[1].toLowerCase() ===
            axelarChain.native_token.symbol.toLowerCase()
      );

      if (!axelarNativeEvmAsset || !axelarNativeEvmAsset.denoms) {
        throw new Error("Axelar gas asset not found");
      }

      return axelarNativeEvmAsset.denoms[1];
    }

    // Match asset address against some Axelar asset's list of addresses
    const axelarSourceAsset = axelarAssets.find(({ addresses }) =>
      Object.keys(addresses).some(
        (address) =>
          addresses[address]?.ibc_denom?.toLowerCase() ===
            asset.address.toLowerCase() ||
          addresses[address]?.address?.toLowerCase() ===
            asset.address.toLowerCase()
      )
    );

    if (!axelarSourceAsset) {
      throw new Error("Axelar source asset not found: " + asset.address);
    }

    // Indicates asset is autowrappable, Axelar APIs accept the wrapped denom here
    if (axelarSourceAsset.denoms) {
      return axelarSourceAsset.denoms[0];
    }

    // Asset is not autowrappable, the denom is the ID accepted by Axelar APIs
    return axelarSourceAsset.denom;
  }

  /**
   * Returns chain ID considered canonical by Axelar and its APIs.
   * @throws if not found in Axelar chain or asset list.
   */
  async getAxelarChainId({ chainId }: BridgeChain) {
    const axelarChains = await getAxelarChains({ env: this.ctx.env });

    // Axelar's chain_id is the canonical chain ID used in most registries
    const axelarChain = axelarChains.find(
      ({ chain_id }) => chain_id === chainId
    );

    if (!axelarChain) {
      throw new Error(`Chain not found: ${chainId}`);
    }

    return axelarChain.id;
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
    fromAsset,
    toAddress,
  }: GetBridgeExternalUrlParams): Promise<BridgeExternalUrl | undefined> {
    const [fromChainId, toChainId, toAssetId] = await Promise.all([
      this.getAxelarChainId(fromChain),
      this.getAxelarChainId(toChain),
      this.getAxelarAssetId(fromChain, fromAsset),
    ]);

    const url = new URL(
      this.ctx.env === "mainnet"
        ? "https://satellite.money/"
        : "https://testnet.satellite.money/"
    );
    url.searchParams.set("source", fromChainId);
    url.searchParams.set("destination", toChainId);
    // asset_denom denotes the selection of the from asset
    url.searchParams.set("asset_denom", toAssetId);
    url.searchParams.set("destination_address", toAddress);

    return { urlProviderName: "Satellite Money", url };
  }
}

export * from "./tokens";
export * from "./transfer-status";
