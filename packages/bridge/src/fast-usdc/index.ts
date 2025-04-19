import type { Registry } from "@cosmjs/proto-signing";
import {
  EthereumChainInfo,
  isNil,
  NativeEVMTokenConstantAddress,
} from "@osmosis-labs/utils";
import bigInteger from "big-integer";
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
  EvmBridgeTransactionRequest,
  GetBridgeExternalUrlParams,
  GetBridgeQuoteParams,
  GetBridgeSupportedAssetsParams,
} from "../interface";
import { SkipApiClient } from "../skip/client";
import { SkipEvmTx, SkipMsg } from "../skip/types";
import { FastUsdcClient } from "./client";

const OSMOSIS_CHAIN_ID = "osmosis-1";
const NATIVE_OSMOSIS_USDC_IBC_DENOM =
  "ibc/498A0751C798A0D9A389AA3691123DADA57DAA4FE165D5C75894505B876BA6E4";

const AGORIC_CHAIN_ID = "agoric-3";
const NATIVE_AGORIC_USDC_IBC_DENOM =
  "ibc/FE98AAD68F02F03565E9FA39A5E627946699B2B07115889ED812D8BA639576A9";

const TARGET_USDC_ASSETS: { [chainId: number]: string } = {
  1: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48", // Ethereum
  137: "0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359", // Polygon (Native)
  42161: "0xaf88d065e77c8cC2239327C5EDb3A432268e5831", // Arbitrum (Native)
  10: "0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85", // Optimism (Native)
  8453: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913", // Base (Native)
};

const USDC_DECIMALS = 6;
const FAST_USDC_ESTIMATED_TIME_SECONDS = 60;

export class FastUsdcBridgeProvider implements BridgeProvider {
  static readonly ID = "FastUsdc";
  readonly providerName = FastUsdcBridgeProvider.ID;

  readonly skipClient: SkipApiClient;
  readonly fastUsdcClient: FastUsdcClient;
  protected protoRegistry: Registry | null = null;

  constructor(protected readonly ctx: BridgeProviderContext) {
    this.skipClient = new SkipApiClient(ctx.env);
    this.fastUsdcClient = new FastUsdcClient(ctx);
  }

  getExternalUrl(
    _params: GetBridgeExternalUrlParams
  ): Promise<BridgeExternalUrl | undefined> {
    throw new Error("Method not implemented.");
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
        id: FastUsdcBridgeProvider.ID,
        fromAmount,
        fromAsset,
        fromChain,
        fromAddress,
        toAddress,
        toAsset,
        toChain,
        slippage,
      }),
      ttl:
        process.env.NODE_ENV === "test" ||
        process.env.NODE_ENV === "development"
          ? -1
          : 20 * 1000, // 20 seconds
      getFreshValue: async (): Promise<BridgeQuote> => {
        const [
          sourceAsset,
          destinationAsset,
          isAllowedInNetworkConfig,
          poolBalance,
          chainPolicies,
          feeConfig,
          destinationAddress, // Skip route destination address
        ] = await Promise.all([
          this.getAsset(fromChain, fromAsset),
          this.getAsset(toChain, toAsset),
          this.fastUsdcClient.isAllowedInNetworkConfig(),
          this.fastUsdcClient.getPoolBalance(),
          this.fastUsdcClient.getChainPolicies(),
          this.fastUsdcClient.getFeeConfig(),
          this.fastUsdcClient.getSkipRouteDestinationAddress(toAddress),
        ]);

        if (!sourceAsset) {
          throw new BridgeQuoteError({
            bridgeId: FastUsdcBridgeProvider.ID,
            errorType: "UnsupportedQuoteError",
            message: `Unsupported asset ${fromAsset.denom} on ${fromChain.chainName}`,
          });
        }

        if (!destinationAsset) {
          throw new BridgeQuoteError({
            bridgeId: FastUsdcBridgeProvider.ID,
            errorType: "UnsupportedQuoteError",
            message: `Unsupported asset ${toAsset.denom} on ${toChain.chainName}`,
          });
        }

        if (!isAllowedInNetworkConfig) {
          throw new BridgeQuoteError({
            bridgeId: FastUsdcBridgeProvider.ID,
            errorType: "UnsupportedQuoteError",
            message: "Fast USDC service is currently disabled",
          });
        }

        if (bigInteger(fromAmount).greater(poolBalance)) {
          throw new BridgeQuoteError({
            bridgeId: FastUsdcBridgeProvider.ID,
            errorType: "InsufficientAmountError",
            message: "Insufficient pool balance",
          });
        }

        const sourceChainPolicy = Object.values(chainPolicies).find(
          (policy) => policy.chainId === fromChain.chainId
        );
        const limit = bigInteger(
          sourceChainPolicy?.rateLimits?.tx?.digits ?? "0"
        );
        if (bigInteger(fromAmount).greater(limit)) {
          const prettyAmount = limit.divide(bigInteger(10).pow(USDC_DECIMALS));
          throw new BridgeQuoteError({
            bridgeId: FastUsdcBridgeProvider.ID,
            errorType: "UnsupportedQuoteError",
            message: `Exceeds source chain limit of ${prettyAmount}`,
          });
        }

        const [route, nobleForwardingAddress] = await Promise.all([
          this.skipClient
            .route({
              source_asset_denom: sourceAsset.denom,
              source_asset_chain_id: fromChain.chainId.toString(),
              dest_asset_denom: NATIVE_AGORIC_USDC_IBC_DENOM,
              dest_asset_chain_id: AGORIC_CHAIN_ID,
              amount_in: fromAmount,
              allow_unsafe: true,
              allow_multi_tx: true,
              smart_relay: true,
              bridges: ["IBC", "CCTP", "HYPERLANE"],
              experimental_features: ["cctp", "hyperlane"],
            })
            .catch((e) => {
              if (e instanceof Error) {
                const msg = e.message;
                if (
                  msg.includes(
                    "Input amount is too low to cover"
                    // Could be Axelar or CCTP
                  )
                ) {
                  throw new BridgeQuoteError({
                    bridgeId: FastUsdcBridgeProvider.ID,
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
                    bridgeId: FastUsdcBridgeProvider.ID,
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
                    bridgeId: FastUsdcBridgeProvider.ID,
                    errorType: "NoQuotesError",
                    message: msg,
                  });
                }
              }
              throw e;
            }),
          this.fastUsdcClient.getNobleForwardingAddress(destinationAddress),
        ]);

        const fastUsdcFee = bigInteger(feeConfig.flatPortion).add(
          bigInteger(feeConfig.numerator)
            .multiply(bigInteger(route.amount_out))
            .divide(bigInteger(feeConfig.denominator))
        );

        if (fastUsdcFee.greater(bigInteger(route.amount_out))) {
          throw new BridgeQuoteError({
            bridgeId: FastUsdcBridgeProvider.ID,
            errorType: "InsufficientAmountError",
            message: "Insufficient amount to cover fees",
          });
        }

        const skipFee = bigInteger(route.amount_in).minus(
          bigInteger(route.amount_out)
        );
        const transferFee: BridgeCoin & { chainId: number | string } = {
          ...fromAsset,
          coinGeckoId: sourceAsset.coingecko_id,
          amount: fastUsdcFee.add(skipFee).toString(),
          chainId: fromChain.chainId,
        };

        const expectedAmountOut = bigInteger(route.amount_out).minus(
          fastUsdcFee
        );

        const addressList = [
          fromAddress,
          nobleForwardingAddress,
          destinationAddress,
        ];

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
            amount: expectedAmountOut.toString(),
            coinGeckoId: destinationAsset.coingecko_id,
            ...toAsset,
            priceImpact: "0",
          },
          fromChain,
          toChain,
          transferFee,
          estimatedTime: FAST_USDC_ESTIMATED_TIME_SECONDS,
          transactionRequest,
          estimatedGasFee,
        };
      },
    });
  }

  /**
   * Returns the target assets supported by FastUSDC (native USDC on specific EVM chains)
   * *if* the input asset is native USDC on Osmosis.
   */
  async getSupportedAssets({
    chain,
    asset,
  }: GetBridgeSupportedAssetsParams): Promise<
    (BridgeChain & BridgeSupportedAsset)[]
  > {
    const isNativeOsmosisUsdc =
      chain.chainId === OSMOSIS_CHAIN_ID &&
      asset.address === NATIVE_OSMOSIS_USDC_IBC_DENOM;

    if (!isNativeOsmosisUsdc) {
      return [];
    }

    try {
      const [allChains, allAssetsData] = await Promise.all([
        this.getChains(),
        this.getAssets(),
      ]);

      const supportedTargets: (BridgeChain & BridgeSupportedAsset)[] = [];

      for (const targetChainIdStr of Object.keys(TARGET_USDC_ASSETS)) {
        const targetChainId = Number(targetChainIdStr);
        const targetUsdcAddress =
          TARGET_USDC_ASSETS[targetChainId].toLowerCase();

        const targetChainInfo = allChains.find(
          (c: any) => c.chain_id === targetChainIdStr
        );

        if (!targetChainInfo || targetChainInfo.chain_type !== "evm") {
          console.warn(
            `FastUSDC: Target EVM chain ${targetChainIdStr} not found or not EVM in Skip data.`
          );
          continue;
        }

        let targetUsdcAssetInfo: any = null;
        const assetsForChain = allAssetsData[targetChainIdStr]?.assets ?? [];
        targetUsdcAssetInfo = assetsForChain.find(
          (a: any) =>
            a.token_contract?.toLowerCase() === targetUsdcAddress &&
            a.decimals === USDC_DECIMALS
        );

        if (!targetUsdcAssetInfo) {
          console.warn(
            `FastUSDC: Native USDC asset (${targetUsdcAddress}) not found on chain ${targetChainIdStr} in Skip data.`
          );
          continue;
        }

        const supportedAssetInfo: BridgeSupportedAsset = {
          address: targetUsdcAddress,
          denom: "USDC",
          decimals: USDC_DECIMALS,
          coinGeckoId: targetUsdcAssetInfo.coingecko_id,
          transferTypes: ["quote"],
        };

        supportedTargets.push({
          chainId: targetChainId,
          chainName: targetChainInfo.chain_name,
          chainType: "evm",
          ...supportedAssetInfo,
        });
      }

      return supportedTargets;
    } catch (e) {
      if (process.env.NODE_ENV !== "production") {
        console.error(
          FastUsdcBridgeProvider.ID,
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
    return transactionRequest;
  }

  async createTransaction(
    fromChainId: string,
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
      key: FastUsdcBridgeProvider.ID + `_assets_${chainID}`,
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
      key: FastUsdcBridgeProvider.ID + "_chains",
      ttl: 1000 * 60 * 30, // 30 minutes
      getFreshValue: () => this.skipClient.chains(),
    });
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
}
