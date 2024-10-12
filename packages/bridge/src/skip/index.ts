import type { Registry } from "@cosmjs/proto-signing";
import {
  estimateGasFee,
  makeExecuteCosmwasmContractMsg,
  makeIBCTransferMsg,
} from "@osmosis-labs/tx";
import { CosmosCounterparty, EVMCounterparty } from "@osmosis-labs/types";
import {
  EthereumChainInfo,
  isNil,
  NativeEVMTokenConstantAddress,
} from "@osmosis-labs/utils";
import cachified from "cachified";
import {
  Address,
  createPublicClient,
  encodeFunctionData,
  encodePacked,
  erc20Abi,
  http,
  keccak256,
  maxUint256,
  numberToHex,
} from "viem";

import { BridgeQuoteError } from "../errors";
import {
  BridgeAsset,
  BridgeChain,
  BridgeCoin,
  BridgeExternalUrl,
  BridgeProvider,
  BridgeProviderContext,
  BridgeQuote,
  BridgeSupportedAsset,
  BridgeTransactionRequest,
  CosmosBridgeTransactionRequest,
  EvmBridgeTransactionRequest,
  GetBridgeExternalUrlParams,
  GetBridgeQuoteParams,
  GetBridgeSupportedAssetsParams,
} from "../interface";
import { BridgeAssetMap } from "../utils";
import { SkipApiClient } from "./client";
import { SkipEvmTx, SkipMsg, SkipMultiChainMsg } from "./types";

export class SkipBridgeProvider implements BridgeProvider {
  static readonly ID = "Skip";
  readonly providerName = SkipBridgeProvider.ID;

  readonly skipClient: SkipApiClient;
  protected protoRegistry: Registry | null = null;

  constructor(protected readonly ctx: BridgeProviderContext) {
    this.skipClient = new SkipApiClient(ctx.env);
  }

  async getQuote(params: GetBridgeQuoteParams): Promise<BridgeQuote> {
    const {
      fromAmount,
      fromAsset,
      fromChain,
      toAsset,
      toChain,
      fromAddress,
      toAddress,
      slippage,
    } = params;

    return cachified({
      cache: this.ctx.cache,
      key: JSON.stringify({
        id: SkipBridgeProvider.ID,
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
        const sourceAsset = await this.getAsset(fromChain, fromAsset);

        if (!sourceAsset) {
          throw new BridgeQuoteError({
            bridgeId: SkipBridgeProvider.ID,
            errorType: "UnsupportedQuoteError",
            message: `Unsupported asset ${fromAsset.denom} on ${fromChain.chainName}`,
          });
        }

        const destinationAsset = await this.getAsset(toChain, toAsset);

        if (!destinationAsset) {
          throw new BridgeQuoteError({
            bridgeId: SkipBridgeProvider.ID,
            errorType: "UnsupportedQuoteError",
            message: `Unsupported asset ${toAsset.denom} on ${toChain.chainName}`,
          });
        }

        const route = await this.skipClient
          .route({
            source_asset_denom: sourceAsset.denom,
            source_asset_chain_id: fromChain.chainId.toString(),
            dest_asset_denom: destinationAsset.denom,
            dest_asset_chain_id: toChain.chainId.toString(),
            amount_in: fromAmount,
          })
          .catch((e) => {
            if (e instanceof Error) {
              const msg = e.message;
              if (
                msg.includes(
                  "Input amount is too low to cover"
                  // Could be Axelar or CCTP
                ) ||
                msg.includes(
                  "Difference in USD value of route input and output is too large"
                )
              ) {
                throw new BridgeQuoteError({
                  bridgeId: SkipBridgeProvider.ID,
                  errorType: "InsufficientAmountError",
                  message: msg,
                });
              }
              if (
                msg.includes(
                  "cannot transfer across cctp after route demands swap"
                )
              ) {
                throw new BridgeQuoteError({
                  bridgeId: SkipBridgeProvider.ID,
                  errorType: "NoQuotesError",
                  message: msg,
                });
              }
              if (
                msg.includes(
                  "no single-tx routes found, to enable multi-tx routes set allow_multi_tx to true"
                ) ||
                msg.includes("no routes found")
              ) {
                throw new BridgeQuoteError({
                  bridgeId: SkipBridgeProvider.ID,
                  errorType: "NoQuotesError",
                  message: msg,
                });
              }
            }
            throw e;
          });

        const addressList = await this.getAddressList(
          route.chain_ids,
          fromAddress,
          toAddress,
          fromChain,
          toChain
        );

        let transferFee: BridgeCoin & { chainId: number | string } = {
          ...fromAsset,
          coinGeckoId: sourceAsset.coingecko_id,
          amount: "0",
          chainId: fromChain.chainId,
        };

        for (const operation of route.operations) {
          if ("axelar_transfer" in operation) {
            const feeAsset = operation.axelar_transfer.fee_asset;

            transferFee = {
              amount: operation.axelar_transfer.fee_amount,
              denom: feeAsset.symbol ?? feeAsset.denom,
              chainId: feeAsset.is_evm
                ? Number(feeAsset.chain_id)
                : feeAsset.chain_id,
              address:
                feeAsset.is_evm && !Boolean(feeAsset.token_contract)
                  ? NativeEVMTokenConstantAddress
                  : feeAsset.token_contract!,
              decimals: feeAsset.decimals ?? 6,
              coinGeckoId: feeAsset.coingecko_id,
            };
          }
        }

        const { msgs } = await this.skipClient.messages({
          address_list: addressList,
          source_asset_denom: route.source_asset_denom,
          source_asset_chain_id: route.source_asset_chain_id,
          dest_asset_denom: route.dest_asset_denom,
          dest_asset_chain_id: route.dest_asset_chain_id,
          amount_in: route.amount_in,
          amount_out: route.amount_out,
          operations: route.operations,
        });

        const transactionRequest = await this.createTransaction(
          fromChain.chainId.toString(),
          toChain,
          fromAddress as Address,
          msgs
        );

        if (!transactionRequest) {
          throw new Error("Failed to create transaction");
        }

        const estimatedGasFee = await this.estimateGasFee(
          params,
          transactionRequest
        );

        return {
          input: {
            coinGeckoId: sourceAsset.coingecko_id,
            ...fromAsset,
            amount: fromAmount,
          },
          expectedOutput: {
            amount: route.amount_out,
            coinGeckoId: destinationAsset.coingecko_id,
            ...toAsset,
            priceImpact: "0",
          },
          fromChain,
          toChain,
          transferFee,
          estimatedTime: route.estimated_route_duration_seconds,
          transactionRequest:
            transactionRequest.type === "cosmos" && estimatedGasFee?.gas
              ? {
                  ...transactionRequest,
                  gasFee: {
                    gas: estimatedGasFee.gas,
                    denom: estimatedGasFee.address,
                    amount: estimatedGasFee.amount,
                  },
                }
              : transactionRequest,
          estimatedGasFee,
        };
      },
    });
  }

  /**
   * Returns the source/origin asset variants that can be used to reach a given chain and asset.
   *
   * Currently, just supports IBC shared origin assets. But can be expanded to support EVM-swappable assets
   * and CCTP variants.
   */
  async getSupportedAssets({
    chain,
    asset,
  }: GetBridgeSupportedAssetsParams): Promise<
    (BridgeChain & BridgeSupportedAsset)[]
  > {
    try {
      const chainAsset = await this.getAsset(chain, asset);
      if (!chainAsset) throw new Error("Asset not found: " + asset.address);

      // Use of toLowerCase is advised due to registry (Skip + others) differences
      // in casing of asset addresses. May be somewhat unsafe.
      // See original usage in `getAsset` method.

      // find variants
      const assets = await this.getAssets();
      const foundVariants = new BridgeAssetMap<
        BridgeChain & BridgeSupportedAsset
      >();

      // asset list counterparties
      const assetListAsset = this.ctx.assetLists
        .flatMap(({ assets }) => assets)
        .find(
          (a) =>
            a.coinMinimalDenom.toLowerCase() === asset.address.toLowerCase()
        );

      const counterparties = assetListAsset?.counterparty ?? [];
      // since skip supports cosmos swap, we can include other asset list
      // counterparties of the same variant
      if (assetListAsset) {
        const variantAssets = this.ctx.assetLists.flatMap(({ assets }) =>
          assets.filter(
            (asset) => asset.variantGroupKey === assetListAsset.variantGroupKey
          )
        );
        counterparties.push(
          ...variantAssets.flatMap((asset) => asset.counterparty)
        );
      }

      for (const counterparty of counterparties) {
        // check if supported by skip
        if (!("chainId" in counterparty)) continue;
        const address =
          "address" in counterparty
            ? counterparty.address
            : counterparty.sourceDenom;
        const skipCounterparty = assets[counterparty.chainId]?.assets.find(
          (a) =>
            counterparty.chainType === "evm" &&
            address === NativeEVMTokenConstantAddress
              ? /**
                 * Skip labels native tokens as "native" and uses the symbol of the counterparty
                 */
                a.denom.toLowerCase() === address.toLowerCase() ||
                (a.denom.includes("native") &&
                  a.symbol?.toLowerCase() === counterparty.symbol.toLowerCase())
              : a.denom.toLowerCase() === address.toLowerCase()
        );

        if (!skipCounterparty) continue;

        if (counterparty.chainType === "cosmos") {
          const c = counterparty as CosmosCounterparty;

          foundVariants.setAsset(c.chainId, address, {
            type: "quote",
            chainId: c.chainId,
            chainType: "cosmos",
            address: address,
            denom: c.symbol,
            decimals: c.decimals,
            coinGeckoId: skipCounterparty.coingecko_id,
          });
        }

        if (counterparty.chainType === "evm") {
          const c = counterparty as EVMCounterparty;

          foundVariants.setAsset(c.chainId.toString(), address, {
            type: "quote",
            chainId: c.chainId,
            chainType: "evm",
            address: address,
            denom: c.symbol,
            decimals: c.decimals,
            coinGeckoId: skipCounterparty.coingecko_id,
          });
        }
      }

      // IBC shared origin assets
      const sharedOriginAssets = Object.keys(assets).flatMap((chainID) => {
        const chainAssets = assets[chainID].assets;

        return chainAssets.filter(
          (asset) =>
            asset.origin_denom.toLowerCase() ===
              chainAsset.origin_denom.toLowerCase() &&
            asset.origin_chain_id === chainAsset.origin_chain_id &&
            asset.denom.toLowerCase() !== chainAsset.denom.toLowerCase()
        );
      });

      for (const sharedOriginAsset of sharedOriginAssets) {
        const chainInfo = sharedOriginAsset.is_evm
          ? {
              chainId: Number(sharedOriginAsset.chain_id),
              chainType: "evm" as const,
            }
          : !sharedOriginAsset.is_svm
          ? {
              chainId: sharedOriginAsset.chain_id as string,
              chainType: "cosmos" as const,
            }
          : undefined;

        if (!chainInfo) continue;

        foundVariants.setAsset(
          sharedOriginAsset.chain_id,
          sharedOriginAsset.denom,
          {
            ...chainInfo,
            type: "quote",
            address: sharedOriginAsset.denom,
            denom:
              sharedOriginAsset.recommended_symbol ??
              sharedOriginAsset.symbol ??
              sharedOriginAsset.name ??
              sharedOriginAsset.denom,
            decimals: sharedOriginAsset.decimals ?? asset.decimals,
            coinGeckoId: sharedOriginAsset.coingecko_id,
          }
        );
      }

      // TODO: when Skip supports new features
      // * CCTP variants
      // * EVM swappable variants

      return foundVariants.assets;
    } catch (e) {
      // Avoid returning options if there's an unexpected error, such as the provider being down
      if (process.env.NODE_ENV !== "production") {
        console.error(
          SkipBridgeProvider.ID,
          "failed to get supported assets:",
          e
        );
      }
      return [];
    }
  }

  async getTransactionData(
    params: GetBridgeQuoteParams
  ): Promise<BridgeTransactionRequest> {
    const quote = await this.getQuote(params);
    const transactionRequest = quote.transactionRequest!;
    const estimatedGasFee = await this.estimateGasFee(
      params,
      transactionRequest
    );
    return transactionRequest.type === "cosmos" && estimatedGasFee?.gas
      ? {
          ...transactionRequest,
          gasFee: {
            gas: estimatedGasFee.gas,
            denom: estimatedGasFee.address,
            amount: estimatedGasFee.amount,
          },
        }
      : transactionRequest;
  }

  async createTransaction(
    fromChainId: string,
    toChain: BridgeChain,
    address: Address,
    messages: SkipMsg[]
  ) {
    for (const message of messages) {
      if ("evm_tx" in message) {
        return await this.createEvmTransaction(
          fromChainId,
          address,
          message.evm_tx
        );
      }

      if ("multi_chain_msg" in message) {
        return await this.createCosmosTransaction(
          toChain,
          message.multi_chain_msg
        );
      }
    }
  }

  async createCosmosTransaction(
    toChain: BridgeChain,
    message: SkipMultiChainMsg
  ): Promise<CosmosBridgeTransactionRequest & { fallbackGasLimit?: number }> {
    const messageData = JSON.parse(message.msg);

    if ("contract" in messageData) {
      // is a cosmwasm contract call

      const cosmwasmData = messageData as {
        sender: string;
        contract: string;
        msg: object;
        funds: {
          denom: string;
          amount: string;
        }[];
      };

      const { typeUrl, value: msg } = await makeExecuteCosmwasmContractMsg({
        sender: cosmwasmData.sender,
        contract: cosmwasmData.contract,
        msg: cosmwasmData.msg,
        funds: cosmwasmData.funds,
      });

      return {
        type: "cosmos",
        msgTypeUrl: typeUrl,
        msg,
        fallbackGasLimit: makeExecuteCosmwasmContractMsg.gas,
      };
    } else {
      // is an ibc transfer

      // If toChain is not cosmos, this IBC transfer is an
      // intermediary IBC transfer where we need to get the
      // timeout from the bech32 prefix of the receiving address
      const timeoutHeight = await this.ctx.getTimeoutHeight(
        toChain.chainType === "cosmos"
          ? toChain
          : { destinationAddress: messageData.receiver }
      );

      const { typeUrl, value } = await makeIBCTransferMsg({
        sourcePort: messageData.source_port,
        sourceChannel: messageData.source_channel,
        token: {
          denom: messageData.token.denom,
          amount: messageData.token.amount,
        },
        sender: messageData.sender,
        receiver: messageData.receiver,
        // @ts-ignore
        timeoutHeight,
        timeoutTimestamp: "0" as any,
        memo: messageData.memo,
      });

      return {
        type: "cosmos",
        msgTypeUrl: typeUrl,
        msg: value,
        fallbackGasLimit: makeIBCTransferMsg.gas,
      };
    }
  }

  async createEvmTransaction(
    chainID: string,
    sender: Address,
    message: SkipEvmTx
  ): Promise<EvmBridgeTransactionRequest> {
    let approvalTransactionRequest;
    if (message.required_erc20_approvals.length > 0) {
      approvalTransactionRequest = await this.getApprovalTransactionRequest(
        chainID,
        message.required_erc20_approvals[0].token_contract,
        sender,
        message.required_erc20_approvals[0].spender,
        message.required_erc20_approvals[0].amount
      );
    }

    return {
      type: "evm",
      to: message.to as Address,
      data: `0x${message.data}`,
      value: numberToHex(BigInt(message.value)),
      approvalTransactionRequest,
    };
  }

  private getViemProvider(chainID: string) {
    const evmChain = EthereumChainInfo.find(
      (chain) => chain.id.toString() === chainID
    );

    if (!evmChain) {
      throw new Error("Could not find EVM chain");
    }

    const provider = createPublicClient({
      chain: evmChain,
      transport: http(evmChain.rpcUrls.default.http[0]),
    });

    return provider;
  }

  async getApprovalTransactionRequest(
    chainID: string,
    tokenAddress: Address,
    owner: Address,
    spender: Address,
    amount: string
  ): Promise<
    | {
        to: string;
        data: string;
      }
    | undefined
  > {
    const provider = this.getViemProvider(chainID);

    const allowance = await provider.readContract({
      abi: erc20Abi,
      address: tokenAddress,
      functionName: "allowance",
      args: [owner, spender],
    });

    if (BigInt(allowance.toString()) >= BigInt(amount)) {
      return;
    }

    const approveTxData = encodeFunctionData({
      abi: erc20Abi,
      functionName: "approve",
      args: [spender, BigInt(amount)],
    });

    return {
      to: tokenAddress,
      data: approveTxData,
    };
  }

  async getAsset(chain: BridgeChain, asset: BridgeAsset) {
    const chainID = chain.chainId.toString();

    const chainAssets = await this.getAssets(chainID);

    for (const skipAsset of chainAssets[chainID].assets) {
      if (chain.chainType === "evm") {
        if (
          asset.address === NativeEVMTokenConstantAddress &&
          !skipAsset.token_contract
        ) {
          return skipAsset;
        }

        if (
          asset.address.toLowerCase() ===
          skipAsset.token_contract?.toLowerCase()
        ) {
          return skipAsset;
        }
      }

      if (chain.chainType === "cosmos") {
        if (asset.address.toLowerCase() === skipAsset.denom.toLowerCase()) {
          return skipAsset;
        }
      }
    }
  }

  getAssets(chainID?: string) {
    return cachified({
      cache: this.ctx.cache,
      key: SkipBridgeProvider.ID + `_assets_${chainID}`,
      ttl: 1000 * 60 * 30, // 30 minutes
      getFreshValue: () =>
        this.skipClient.assets({
          chainID,
        }),
    });
  }

  getChains() {
    return cachified({
      cache: this.ctx.cache,
      key: SkipBridgeProvider.ID + "_chains",
      ttl: 1000 * 60 * 30, // 30 minutes
      getFreshValue: () => this.skipClient.chains(),
    });
  }

  async getAddressList(
    chainIDs: string[],
    fromAddress: string,
    toAddress: string,
    fromChain: BridgeChain,
    toChain: BridgeChain
  ) {
    const [{ fromBech32, toBech32 }, allSkipChains] = await Promise.all([
      import("@cosmjs/encoding"),
      this.getChains(),
    ]);

    const sourceChain = allSkipChains.find((c) => c.chain_id === chainIDs[0]);
    if (!sourceChain) {
      throw new Error(`Failed to find chain ${chainIDs[0]}`);
    }

    const destinationChain = allSkipChains.find(
      (c) => c.chain_id === chainIDs[chainIDs.length - 1]
    );
    if (!destinationChain) {
      throw new Error(`Failed to find chain ${chainIDs[chainIDs.length - 1]}`);
    }

    const addressList = [];

    for (const chainID of chainIDs) {
      const chain = allSkipChains.find((c) => c.chain_id === chainID);
      if (!chain) {
        throw new Error(`Failed to find chain ${chainID}`);
      }

      if (
        chain.chain_type === "evm" &&
        chain.chain_id === String(fromChain.chainId) &&
        fromChain.chainType === "evm"
      ) {
        addressList.push(fromAddress);
      }

      if (
        chain.chain_type === "evm" &&
        chain.chain_id === String(toChain.chainId) &&
        toChain.chainType === "evm"
      ) {
        addressList.push(toAddress);
      }

      if (
        chain.chain_type === "cosmos" &&
        chain.chain_id === String(fromChain.chainId) &&
        fromChain.chainType === "cosmos"
      ) {
        addressList.push(
          toBech32(chain.bech32_prefix, fromBech32(fromAddress).data)
        );
        continue;
      }

      if (
        chain.chain_type === "cosmos" &&
        chain.chain_id === String(toChain.chainId) &&
        toChain.chainType === "cosmos"
      ) {
        addressList.push(
          toBech32(chain.bech32_prefix, fromBech32(toAddress).data)
        );
        continue;
      }

      // This is likely a multi hop IBC, which means either
      // to or from chain & respective addresses can include a cosmos
      // bech32 address that can be used to derive the middle hop cosmos
      // chain address.
      if (chain.chain_type === "cosmos") {
        let bech32Address: string | null = null;
        if (fromChain.chainType === "cosmos") bech32Address = fromAddress;
        if (toChain.chainType === "cosmos") bech32Address = toAddress;
        if (!bech32Address) continue;

        addressList.push(
          toBech32(chain.bech32_prefix, fromBech32(bech32Address).data)
        );
      }
    }

    return addressList;
  }

  async estimateGasFee(
    params: GetBridgeQuoteParams,
    txData: BridgeTransactionRequest & { fallbackGasLimit?: number }
  ) {
    if (txData.type === "evm") {
      const evmChain = EthereumChainInfo.find(
        ({ id: chainId }) => chainId === params.fromChain.chainId
      );

      if (!evmChain)
        throw new Error(
          "Could not find EVM chain: " + params.fromChain.chainId
        );

      const provider = createPublicClient({
        chain: evmChain,
        transport: http(evmChain.rpcUrls.default.http[0]),
      });

      const estimatedGas = await this.estimateEvmGasWithStateOverrides(
        provider,
        params,
        txData
      );
      if (estimatedGas === BigInt(0)) {
        return;
      }

      const gasPrice = await provider.getGasPrice();

      if (!gasPrice) {
        throw new Error("Failed to get gas price");
      }

      const gasCost = estimatedGas * gasPrice;

      return {
        amount: gasCost.toString(),
        denom: evmChain.nativeCurrency.symbol,
        decimals: evmChain.nativeCurrency.decimals,
        address: NativeEVMTokenConstantAddress,
      };
    }

    if (txData.type === "cosmos") {
      const txSimulation = await estimateGasFee({
        chainId: params.fromChain.chainId.toString(),
        chainList: this.ctx.chainList,
        body: {
          messages: [
            (
              await this.getProtoRegistry()
            ).encodeAsAny({
              typeUrl: txData.msgTypeUrl,
              value: txData.msg,
            }),
          ],
        },
        bech32Address: params.fromAddress,
        fallbackGasLimit: txData.fallbackGasLimit,
      }).catch((e) => {
        if (
          e instanceof Error &&
          e.message.includes(
            "No fee tokens found with sufficient balance on account"
          )
        ) {
          throw new BridgeQuoteError({
            bridgeId: SkipBridgeProvider.ID,
            errorType: "InsufficientAmountError",
            message: e.message,
          });
        }

        throw e;
      });

      const gasFee = txSimulation.amount[0];
      const chainAssets = await this.getAssets();
      const { assets } = chainAssets[params.fromChain.chainId.toString()];

      const gasAsset = assets?.find((asset) => asset.denom === gasFee.denom);

      return {
        gas: txSimulation.gas,
        amount: gasFee.amount,
        denom: gasAsset?.symbol ?? gasFee.denom,
        decimals: gasAsset?.decimals ?? 0,
        address: gasAsset?.denom ?? gasFee.denom,
        coinGeckoId: gasAsset?.coingecko_id,
      };
    }
  }

  /** @returns 0 gas if state overrides fail. */
  async estimateEvmGasWithStateOverrides(
    provider: ReturnType<typeof createPublicClient>,
    params: GetBridgeQuoteParams,
    txData: EvmBridgeTransactionRequest
  ) {
    try {
      if (!txData.approvalTransactionRequest) {
        return await provider
          .estimateGas({
            account: params.fromAddress as Address,
            to: txData.to,
            data: txData.data,
            value: !isNil(txData.value) ? BigInt(txData.value) : undefined,
          })
          .then((gas) => BigInt(gas));
      }

      // Adding a stateDiff override allows us to estimate the gas without the user having first approved the ERC20 transfer
      // Otherwise, the estimate call would fail with an error indicating the user has not approved the transfer

      /* Allowance slot (differs from contract to contract but is usually 10) */
      const slot = 10;

      const erc20Balance = keccak256(
        encodePacked(
          ["uint256", "uint256"],
          [BigInt(params.fromAddress), BigInt(slot)]
        )
      );
      const index = keccak256(
        encodePacked(
          ["uint256", "uint256"],
          [BigInt(txData.to), BigInt(erc20Balance)]
        )
      );

      return await provider
        .estimateGas({
          account: params.fromAddress as Address,
          to: txData.to,
          data: txData.data,
          value: !isNil(txData.value) ? BigInt(txData.value) : undefined,
          stateOverride: [
            {
              address: txData.approvalTransactionRequest.to as Address,
              stateDiff: [
                {
                  slot: index,
                  value: `0x${maxUint256.toString(16)}`,
                },
              ],
            },
          ],
        })
        .then((gas) => BigInt(gas));
    } catch (err) {
      console.error("failed to estimate gas:", err);
      return BigInt(0);
    }
  }

  async getProtoRegistry() {
    if (!this.protoRegistry) {
      const [{ ibcProtoRegistry, cosmwasmProtoRegistry }, { Registry }] =
        await Promise.all([
          import("@osmosis-labs/proto-codecs"),
          import("@cosmjs/proto-signing"),
        ]);
      this.protoRegistry = new Registry([
        ...ibcProtoRegistry,
        ...cosmwasmProtoRegistry,
      ]);
    }

    return this.protoRegistry;
  }

  async getExternalUrl({
    fromChain,
    toChain,
    fromAsset,
    toAsset,
  }: GetBridgeExternalUrlParams): Promise<BridgeExternalUrl | undefined> {
    if (this.ctx.env === "testnet") return undefined;

    const url = new URL("https://go.skip.build/");
    if (fromChain?.chainId) {
      url.searchParams.set("src_chain", String(fromChain.chainId));
    }
    if (fromAsset?.address) {
      url.searchParams.set("src_asset", fromAsset.address.toLowerCase());
    }
    if (toChain?.chainId) {
      url.searchParams.set("dest_chain", String(toChain.chainId));
    }
    if (toAsset?.address) {
      url.searchParams.set("dest_asset", toAsset.address.toLowerCase());
    }

    return { urlProviderName: "Skip:Go", url };
  }
}

export * from "./client";
export * from "./transfer-status";
