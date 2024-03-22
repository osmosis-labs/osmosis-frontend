import { fromBech32, toBech32 } from "@cosmjs/encoding";
import { CoinPretty } from "@keplr-wallet/unit";
import { getAssetPrice, getTimeoutHeight } from "@osmosis-labs/server";
import { cosmosMsgOpts } from "@osmosis-labs/stores";
import cachified from "cachified";
import { ethers, JsonRpcProvider } from "ethers";
import { toHex } from "web3-utils";

import { AssetLists } from "~/config/generated/asset-lists";
import { ChainList } from "~/config/generated/chain-list";
import { EthereumChainInfo } from "~/integrations/bridge-info";
import { BridgeQuoteError } from "~/integrations/bridges/errors";
import SkipApiClient from "~/integrations/bridges/skip/queries";
import {
  Erc20Abi,
  NativeEVMTokenConstantAddress,
} from "~/integrations/ethereum";
import { ErrorTypes } from "~/utils/error-types";

import {
  BridgeAsset,
  BridgeChain,
  BridgeCoin,
  BridgeProvider,
  BridgeProviderContext,
  BridgeQuote,
  BridgeTransactionRequest,
  CosmosBridgeTransactionRequest,
  EvmBridgeTransactionRequest,
  GetBridgeQuoteParams,
} from "../types";
import { providerName, SkipEvmTx, SkipMsg, SkipMultiChainMsg } from "./types";

const logoUrl = "/bridges/skip.svg" as const;

export class SkipBridgeProvider implements BridgeProvider {
  static providerName = providerName;
  providerName = providerName;
  logoUrl = logoUrl;

  private skipClient: SkipApiClient;

  constructor(readonly ctx: BridgeProviderContext) {
    this.skipClient = new SkipApiClient();
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
        const sourceAsset = await this.getSkipAsset(fromChain, fromAsset);

        if (!sourceAsset) {
          throw new BridgeQuoteError([
            {
              errorType: ErrorTypes.UnsupportedQuoteError,
              message: `Unsupported asset ${fromAsset.denom} on ${fromChain.chainName}`,
            },
          ]);
        }

        const destinationAsset = await this.getSkipAsset(toChain, toAsset);

        if (!destinationAsset) {
          throw new BridgeQuoteError([
            {
              errorType: ErrorTypes.UnsupportedQuoteError,
              message: `Unsupported asset ${toAsset.denom} on ${toChain.chainName}`,
            },
          ]);
        }

        const amount = new CoinPretty(
          {
            coinDecimals: fromAsset.decimals,
            coinDenom: fromAsset.denom,
            coinMinimalDenom: fromAsset.denom,
          },
          fromAmount
        );

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

        const amountOut = new CoinPretty(
          {
            coinDecimals: toAsset.decimals,
            coinDenom: toAsset.denom,
            coinMinimalDenom: toAsset.denom,
          },
          route.amount_out
        );

        const inputAssetPriceUSD = await getAssetPrice({
          assetLists: AssetLists,
          chainList: ChainList,
          asset: {
            coinDenom: toAsset.denom,
            coinMinimalDenom: toAsset.denom ?? "",
            sourceDenom: toAsset.sourceDenom,
          },
          currency: "usd",
        });

        const outputAssetPriceUSD = await getAssetPrice({
          assetLists: AssetLists,
          chainList: ChainList,
          asset: {
            coinDenom: toAsset.denom,
            coinMinimalDenom: toAsset.denom ?? "",
            sourceDenom: toAsset.sourceDenom,
          },
          currency: "usd",
        });

        let transferFee: BridgeCoin = {
          amount: "0",
          denom: fromAsset.denom,
          sourceDenom: fromAsset.sourceDenom,
          decimals: fromAsset.decimals,
          fiatValue: {
            currency: "usd",
            amount: "0",
          },
        };

        for (const operation of route.operations) {
          if ("axelar_transfer" in operation) {
            const feeAssetPrice = await getAssetPrice({
              assetLists: AssetLists,
              chainList: ChainList,
              asset: {
                coinDenom:
                  operation.axelar_transfer.fee_asset.symbol ??
                  operation.axelar_transfer.fee_asset.denom,
                coinMinimalDenom: operation.axelar_transfer.asset,
                sourceDenom: operation.axelar_transfer.asset,
              },
              currency: "usd",
            });

            const feeAmount = new CoinPretty(
              {
                coinDecimals: operation.axelar_transfer.fee_asset.decimals ?? 6,
                coinDenom:
                  operation.axelar_transfer.fee_asset.symbol ??
                  operation.axelar_transfer.fee_asset.denom,
                coinMinimalDenom: operation.axelar_transfer.fee_asset.denom,
              },
              operation.axelar_transfer.fee_amount
            );

            transferFee = {
              amount: feeAmount.toCoin().amount,
              denom:
                operation.axelar_transfer.fee_asset.symbol ??
                operation.axelar_transfer.fee_asset.denom,
              sourceDenom: operation.axelar_transfer.fee_asset.denom,
              decimals: operation.axelar_transfer.fee_asset.decimals ?? 6,
              fiatValue: {
                currency: "usd",
                amount: feeAmount.mul(feeAssetPrice).toDec().toString(),
              },
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
          fromAddress,
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

        const estimatedTime =
          sourceChainFinalityTime > destinationChainFinalityTime
            ? sourceChainFinalityTime
            : destinationChainFinalityTime;

        const gasCost = await this.estimateGasCost(params, transactionRequest);

        const gasAssetPriceUSD = gasCost
          ? await getAssetPrice({
              assetLists: AssetLists,
              chainList: ChainList,
              asset: {
                coinDenom: gasCost?.denom ?? "",
                sourceDenom: gasCost?.sourceDenom ?? "",
              },
              currency: "usd",
            })
          : undefined;

        return {
          input: {
            amount: fromAmount,
            denom: fromAsset.denom,
            sourceDenom: fromAsset.sourceDenom,
            decimals: fromAsset.decimals,
            fiatValue: {
              currency: "usd",
              amount: amount.mul(inputAssetPriceUSD).toDec().toString(),
            },
          },
          expectedOutput: {
            amount: amountOut.toCoin().amount,
            denom: toAsset.denom,
            sourceDenom: toAsset.sourceDenom,
            fiatValue: {
              currency: "usd",
              amount: amountOut.mul(outputAssetPriceUSD).toDec().toString(),
            },
            decimals: toAsset.decimals,
            priceImpact: "0",
          },
          fromChain,
          toChain,
          transferFee,
          estimatedTime,
          transactionRequest,
          estimatedGasFee:
            gasCost && gasAssetPriceUSD
              ? {
                  ...gasCost,
                  fiatValue: {
                    currency: "usd",
                    amount: new CoinPretty(
                      {
                        coinDecimals: gasCost.decimals,
                        coinDenom: gasCost.sourceDenom,
                        coinMinimalDenom: gasCost.sourceDenom,
                      },
                      gasCost.amount
                    )
                      .mul(gasAssetPriceUSD)
                      .toDec()
                      .toString(),
                  },
                }
              : undefined,
        };
      },
      ttl: 20 * 1000, // 20 seconds,
    });
  }

  async getTransactionData(
    params: GetBridgeQuoteParams
  ): Promise<BridgeTransactionRequest> {
    const quote = await this.getQuote(params);
    return quote.transactionRequest!;
  }

  private async createTransaction(
    chainID: string,
    address: string,
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

  private async createCosmosTransaction(
    message: SkipMultiChainMsg
  ): Promise<CosmosBridgeTransactionRequest> {
    const messageData = JSON.parse(message.msg);

    const timeoutHeight = await getTimeoutHeight({
      chainList: ChainList,
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

  private async createEvmTransaction(
    chainID: string,
    sender: string,
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
      to: message.to,
      data: `0x${message.data}`,
      value: toHex(message.value),
      approvalTransactionRequest,
    };
  }

  private getEthersProvider(chainID: string) {
    const evmChain = Object.values(EthereumChainInfo).find(
      (chain) => chain.chainId.toString() === chainID
    );

    if (!evmChain) {
      throw new Error("Could not find EVM chain");
    }

    const provider = new ethers.JsonRpcProvider(evmChain.rpcUrls[0]);

    return provider;
  }

  private async getApprovalTransactionRequest(
    chainID: string,
    tokenAddress: string,
    owner: string,
    spender: string,
    amount: string
  ): Promise<
    | {
        to: string;
        data: string;
      }
    | undefined
  > {
    const provider = this.getEthersProvider(chainID);

    const fromTokenContract = new ethers.Contract(
      tokenAddress,
      Erc20Abi,
      provider
    );

    const allowance = await fromTokenContract.allowance(owner, spender);

    if (BigInt(allowance.toString()) >= BigInt(amount)) {
      return;
    }

    const approveTx = await fromTokenContract.approve.populateTransaction(
      spender,
      amount
    );

    return {
      to: approveTx.to!,
      data: approveTx.data!,
    };
  }

  private async getSkipAsset(chain: BridgeChain, asset: BridgeAsset) {
    const chainID = chain.chainId.toString();

    const chainAssets = await this.getSkipAssets(chainID);

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

  private async getSkipAssets(chainID: string) {
    return cachified({
      cache: this.ctx.cache,
      key: JSON.stringify({
        id: providerName,
        func: "_getSkipAssets",
        chainID,
      }),
      getFreshValue: async () => {
        return this.skipClient.assets({
          chainID,
        });
      },
    });
  }

  private async getChains() {
    return cachified({
      cache: this.ctx.cache,
      key: JSON.stringify({
        id: providerName,
        func: "_getChains",
      }),
      getFreshValue: async () => {
        return this.skipClient.chains();
      },
    });
  }

  private async getAddressList(
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
    if (txData.type !== "evm") {
      return;
    }

    const evmChain = Object.values(EthereumChainInfo).find(
      ({ chainId }) => chainId === params.fromChain.chainId
    );

    if (!evmChain) throw new Error("Could not find EVM chain");

    const provider = new ethers.JsonRpcProvider(evmChain.rpcUrls[0]);

    const estimatedGas = await this.estimateEvmGasWithStateOverrides(
      provider,
      params,
      txData
    );
    if (estimatedGas === BigInt(0)) {
      return;
    }

    const feeData = await provider.getFeeData();

    if (!feeData.gasPrice) {
      throw new Error("Failed to get gas price");
    }

    const gasCost = estimatedGas * feeData.gasPrice;

    return {
      amount: gasCost.toString(),
      sourceDenom: evmChain.nativeCurrency.symbol,
      decimals: evmChain.nativeCurrency.decimals,
      denom: evmChain.nativeCurrency.symbol,
    };
  }

  async estimateEvmGasWithStateOverrides(
    provider: JsonRpcProvider,
    params: GetBridgeQuoteParams,
    txData: EvmBridgeTransactionRequest
  ) {
    try {
      if (!txData.approvalTransactionRequest) {
        const estimatedGas = await provider.estimateGas({
          from: params.fromAddress,
          to: txData.to,
          data: txData.data,
          value: txData.value,
        });

        return BigInt(estimatedGas);
      }

      const slot = 10; // Allowance slot (differs from contract to contract but is usually 10)

      const temp = ethers.solidityPackedKeccak256(
        ["uint256", "uint256"],
        [params.fromAddress, slot]
      );
      const index = ethers.solidityPackedKeccak256(
        ["uint256", "uint256"],
        [txData.to, temp]
      );

      const callParams = [
        {
          from: params.fromAddress,
          to: txData.to,
          data: txData.data,
          value: txData.value,
        },
        "latest",
      ];

      const stateDiff = {
        [txData.approvalTransactionRequest.to]: {
          stateDiff: {
            [index]: `0x${ethers.MaxUint256.toString(16)}`,
          },
        },
      };

      // Call with no state overrides
      const callResult = await provider.send("eth_estimateGas", [
        ...callParams,
        stateDiff,
      ]);

      return BigInt(callResult);
    } catch (err) {
      console.log("failed to estimate gas:", err);
      return BigInt(0);
    }
  }
}
