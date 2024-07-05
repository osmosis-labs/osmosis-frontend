import { fromBech32, toBech32 } from "@cosmjs/encoding";
import { Registry } from "@cosmjs/proto-signing";
import { ibcProtoRegistry } from "@osmosis-labs/proto-codecs";
import { estimateGasFee } from "@osmosis-labs/tx";
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
  BridgeTransactionRequest,
  CosmosBridgeTransactionRequest,
  EvmBridgeTransactionRequest,
  GetBridgeExternalUrlParams,
  GetBridgeQuoteParams,
  GetBridgeSupportedAssetsParams,
} from "../interface";
import { cosmosMsgOpts } from "../msg";
import { BridgeAssetMap } from "../utils";
import { SkipApiClient } from "./queries";
import { SkipEvmTx, SkipMsg, SkipMultiChainMsg } from "./types";

export class SkipBridgeProvider implements BridgeProvider {
  static readonly ID = "Skip";
  readonly providerName = SkipBridgeProvider.ID;

  readonly skipClient: SkipApiClient;
  protected protoRegistry = new Registry(ibcProtoRegistry);

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

        const route = await this.skipClient.route({
          source_asset_denom: sourceAsset.denom,
          source_asset_chain_id: fromChain.chainId.toString(),
          dest_asset_denom: destinationAsset.denom,
          dest_asset_chain_id: toChain.chainId.toString(),
          amount_in: fromAmount,
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
          fromAddress as Address,
          msgs
        );

        if (!transactionRequest) {
          throw new Error("Failed to create transaction");
        }

        const sourceChainFinalityTime = this.getFinalityTimeForChain(
          sourceAsset.chain_id
        );
        const destinationChainFinalityTime = this.getFinalityTimeForChain(
          destinationAsset.chain_id
        );

        const estimatedTime = Math.max(
          sourceChainFinalityTime,
          destinationChainFinalityTime
        );

        const estimatedGasFee = await this.estimateGasCost(
          params,
          transactionRequest
        );

        return {
          input: {
            ...fromAsset,
            amount: fromAmount,
          },
          expectedOutput: {
            amount: route.amount_out,
            ...toAsset,
            priceImpact: "0",
          },
          fromChain,
          toChain,
          transferFee,
          estimatedTime,
          transactionRequest,
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
  }: GetBridgeSupportedAssetsParams): Promise<(BridgeChain & BridgeAsset)[]> {
    try {
      const chainAsset = await this.getAsset(chain, asset);
      if (!chainAsset) throw new Error("Asset not found: " + asset.address);

      // Use of toLowerCase is advised due to registry (Skip + others) differences
      // in casing of asset addresses. May be somewhat unsafe.
      // See original usage in `getAsset` method.

      // find variants
      const assets = await this.getAssets();
      const foundVariants = new BridgeAssetMap<BridgeChain & BridgeAsset>();

      // asset list counterparties
      const assetListAsset = this.ctx.assetLists
        .flatMap(({ assets }) => assets)
        .find(
          (a) =>
            a.coinMinimalDenom.toLowerCase() === asset.address.toLowerCase()
        );

      for (const counterparty of assetListAsset?.counterparty ?? []) {
        // check if supported by skip
        if (!("chainId" in counterparty)) continue;
        if (
          !assets[counterparty.chainId].assets.some(
            (a) =>
              a.denom.toLowerCase() === counterparty.sourceDenom.toLowerCase()
          )
        )
          continue;

        if (counterparty.chainType === "cosmos") {
          const c = counterparty as CosmosCounterparty;

          // check if supported by skip
          if (
            assets[c.chainId].assets.some(
              (a) => a.denom.toLowerCase() === c.sourceDenom.toLowerCase()
            )
          ) {
            foundVariants.setAsset(c.chainId, c.sourceDenom, {
              chainId: c.chainId,
              chainType: "cosmos",
              address: c.sourceDenom,
              denom: c.symbol,
              decimals: c.decimals,
            });
          }
        }
        if (counterparty.chainType === "evm") {
          const c = counterparty as EVMCounterparty;

          // check if supported by skip
          if (
            assets[c.chainId].assets.some(
              (a) => a.denom.toLowerCase() === c.sourceDenom.toLowerCase()
            )
          ) {
            foundVariants.setAsset(c.chainId.toString(), c.sourceDenom, {
              chainId: c.chainId,
              chainType: "evm",
              address: c.sourceDenom,
              denom: c.symbol,
              decimals: c.decimals,
            });
          }
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
            address: sharedOriginAsset.denom,
            denom:
              sharedOriginAsset.recommended_symbol ??
              sharedOriginAsset.symbol ??
              sharedOriginAsset.name ??
              sharedOriginAsset.denom,
            decimals: sharedOriginAsset.decimals ?? asset.decimals,
          }
        );
      }

      // TODO: when Skip supports new features
      // * CCTP variants
      // * EVM swappable variants

      return foundVariants.assets;
    } catch (e) {
      // Avoid returning options if there's an unexpected error, such as the provider being down
      if (process.env.NODE_ENV === "development") {
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
    return quote.transactionRequest!;
  }

  async createTransaction(
    chainID: string,
    address: Address,
    messages: SkipMsg[]
  ) {
    for (const message of messages) {
      if ("evm_tx" in message) {
        return await this.createEvmTransaction(
          chainID,
          address,
          message.evm_tx
        );
      }

      if ("multi_chain_msg" in message) {
        return await this.createCosmosTransaction(message.multi_chain_msg);
      }
    }
  }

  async createCosmosTransaction(
    message: SkipMultiChainMsg
  ): Promise<CosmosBridgeTransactionRequest> {
    const messageData = JSON.parse(message.msg);

    const timeoutHeight = await this.ctx.getTimeoutHeight({
      destinationAddress: messageData.receiver,
    });

    const { typeUrl, value } = cosmosMsgOpts.ibcTransfer.messageComposer({
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
    };
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
    const evmChain = Object.values(EthereumChainInfo).find(
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
    const allSkipChains = await this.getChains();

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

      if (chain.chain_type === "evm" && fromChain.chainType === "evm") {
        addressList.push(fromAddress);
        continue;
      }

      if (chain.chain_type === "evm" && toChain.chainType === "evm") {
        addressList.push(toAddress);
        continue;
      }

      if (chain.chain_type === "cosmos" && fromChain.chainType === "cosmos") {
        addressList.push(
          toBech32(chain.bech32_prefix, fromBech32(fromAddress).data)
        );
        continue;
      }

      if (chain.chain_type === "cosmos" && toChain.chainType === "cosmos") {
        addressList.push(
          toBech32(chain.bech32_prefix, fromBech32(toAddress).data)
        );
        continue;
      }
    }

    return addressList;
  }

  getFinalityTimeForChain(chainID: string) {
    switch (chainID) {
      case "1":
        return 960;
      case "43114":
        return 3;
      case "137":
        return 300;
      case "56":
        return 46;
      case "250":
        return 3;
      case "10":
        return 1800;
      case "59144":
        return 4860;
      case "314":
        return 3120;
      case "1284":
        return 25;
      case "42220":
        return 12;
      case "42161":
        return 1140;
      case "8453":
        return 1440;
      default:
        return 1;
    }
  }

  async estimateGasCost(
    params: GetBridgeQuoteParams,
    txData: BridgeTransactionRequest
  ) {
    if (txData.type === "evm") {
      const evmChain = Object.values(EthereumChainInfo).find(
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
            this.protoRegistry.encodeAsAny({
              typeUrl: txData.msgTypeUrl,
              value: txData.msg,
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
        denom: gasAsset?.symbol ?? params.fromAsset.denom,
        decimals: gasAsset?.decimals ?? params.fromAsset.decimals,
        address: gasAsset?.coinMinimalDenom ?? params.fromAsset.address,
      };
    }
  }

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

  async getExternalUrl({
    fromChain,
    toChain,
    fromAsset,
    toAsset,
  }: GetBridgeExternalUrlParams): Promise<BridgeExternalUrl | undefined> {
    if (this.ctx.env === "testnet") return undefined;

    const url = new URL("https://ibc.fun/");
    url.searchParams.set("src_chain", String(fromChain.chainId));
    url.searchParams.set("src_asset", fromAsset.address.toLowerCase());
    url.searchParams.set("dest_chain", String(toChain.chainId));
    url.searchParams.set("dest_asset", toAsset.address.toLowerCase());

    return { urlProviderName: "IBC.fun", url };
  }
}

export * from "./transfer-status";
