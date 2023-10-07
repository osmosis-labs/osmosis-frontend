import type {
  ChainsResponse,
  SdkInfoResponse,
  StatusResponse,
  TokensResponse,
} from "@0xsquid/sdk";
import { AxelarQueryAPI, Environment } from "@axelar-network/axelarjs-sdk";
import { CoinPretty, Dec } from "@keplr-wallet/unit";
import { cachified } from "cachified";

import { ChainInfos } from "~/config";
import { getAssetFromWalletAssets } from "~/config/utils";
import { EthereumChainInfo } from "~/integrations/bridge-info";
import { querySimplePrice } from "~/queries/coingecko";

import {
  BridgeAsset,
  BridgeChain,
  BridgeProvider,
  BridgeProviderContext,
  BridgeQuote,
  BridgeQuoteError,
  BridgeStatus,
  GetBridgeQuoteParams,
} from "../types";

const providerName = "Axelar" as const;
export class AxelarBridgeProvider implements BridgeProvider {
  static providerName = providerName;
  providerName = providerName;
  logoUrl = "/bridges/axelar.svg";
  client = new AxelarQueryAPI({ environment: Environment.MAINNET });

  constructor(readonly ctx: BridgeProviderContext) {}

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
              coinMinimalDenom: fromAsset.minimalDenom ?? fromAsset.denom,
            },
            fromAmount
          ).toCoin().amount;

          const fromChainAxelarId =
            fromChain.chainType === "cosmos"
              ? ChainInfos.find(({ chainId }) => chainId === fromChain.chainId)
                  ?.axelarChainId
              : Object.values(EthereumChainInfo).find(
                  ({ chainId }) => chainId === fromChain.chainId
                )?.chainName;

          const toChainAxelarId =
            toChain.chainType === "cosmos"
              ? ChainInfos.find(({ chainId }) => chainId === toChain.chainId)
                  ?.axelarChainId
              : Object.values(EthereumChainInfo).find(
                  ({ chainId }) => chainId === toChain.chainId
                )?.chainName;

          if (!fromChainAxelarId || !toChainAxelarId) {
            throw new BridgeQuoteError([
              {
                errorType: "Unsupported Quote",
                message: "Axelar Bridge doesn't support this quote",
              },
            ]);
          }

          const transferFeeRes = await this.client.getTransferFee(
            fromChainAxelarId,
            toChainAxelarId,
            fromAsset.minimalDenom,
            Number(amount)
          );

          if (!transferFeeRes.fee) {
            throw new BridgeQuoteError([
              {
                errorType: "Unsupported Quote",
                message: "Axelar Bridge doesn't support this quote",
              },
            ]);
          }

          const transferFeeAsset = getAssetFromWalletAssets(
            transferFeeRes.fee.denom
          );

          const currency = "usd";
          let transferFeeFiatValue;
          if (
            transferFeeAsset?.coingecko_id &&
            !transferFeeAsset.coingecko_id.startsWith("pool:")
          ) {
            const id = transferFeeAsset.coingecko_id;
            const price = await querySimplePrice([id], [currency]);
            transferFeeFiatValue = price[transferFeeAsset.coingecko_id]["usd"];
          }

          return {
            estimatedTime: this.getWaitTime(fromChainAxelarId),
            fromAmount,
            toAmount: fromAmount,
            toAmountMin: fromAmount,
            transferFee: {
              amount: transferFeeRes.fee.amount,
              denom: transferFeeRes.fee.denom,
              coinMinimalDenom: transferFeeRes.fee.denom,
              decimals: fromAsset.decimals,
              ...(transferFeeFiatValue && {
                fiatValue: {
                  currency,
                  amount: new CoinPretty(
                    {
                      coinDecimals: fromAsset.decimals,
                      coinDenom: fromAsset.denom,
                      coinMinimalDenom: fromAsset.minimalDenom,
                    },
                    transferFeeRes.fee.amount
                  )
                    .mul(new Dec(transferFeeFiatValue))
                    .toDec()
                    .toString(),
                },
              }),
            },
          };
        } catch (e) {
          const error = e as string | BridgeQuoteError | Error;

          if (error instanceof BridgeQuoteError) {
            throw error;
          }

          if (error instanceof Error) {
            throw new BridgeQuoteError([
              {
                errorType: "Unknown Error",
                message: error.message,
              },
            ]);
          }

          let errorType = "Unknown Error";
          if (error.includes("not found")) {
            errorType = "Unsupported Quote";
          }

          throw new BridgeQuoteError([
            {
              errorType,
              message: error,
            },
          ]);
        }
      },
      ttl: 20 * 1000, // 20 seconds,
    });
  }

  async getStatus(): Promise<BridgeStatus> {
    return cachified({
      cache: this.ctx.cache,
      key: "status",
      getFreshValue: async () => {
        const response = await fetch(`${this.apiURL}/v1/sdk-info`);
        const data: SdkInfoResponse = await response.json();

        if (!response.ok) {
          throw data;
        }

        return {
          isInMaintenanceMode: data.isInMaintenanceMode,
          maintenanceMessage: data.maintenanceMessage,
        };
      },
      ttl: 60 * 1000, // 1 minute
    });
  }

  async executeRoute(): Promise<any> {}

  async getAssets(): Promise<BridgeAsset[]> {
    return cachified({
      cache: this.ctx.cache,
      key: "assets",
      getFreshValue: async () => {
        const response = await fetch(`${this.apiURL}/v1/tokens`);
        const data: TokensResponse = await response.json();

        if (!response.ok) {
          throw data;
        }

        return data.tokens.map(({ symbol, address }) => ({
          denom: symbol,
          address,
        }));
      },
      // 30 minutes
      ttl: 30 * 60 * 1000,
    });
  }

  async getChains(): Promise<BridgeChain[]> {
    return cachified({
      cache: this.ctx.cache,
      key: "chains",
      getFreshValue: async () => {
        const response = await fetch(`${this.apiURL}/v1/chains`);
        const data: ChainsResponse = await response.json();

        if (!response.ok) {
          throw data;
        }

        return data.chains.map(
          ({ networkName, chainId, chainType, chainName }) => ({
            networkName,
            chainId,
            chainName,
            chainType,
          })
        );
      },
      // 30 minutes
      ttl: 30 * 60 * 1000,
    });
  }

  async getTransferStatus(params: {
    sendTxHash: string;
  }): Promise<StatusResponse> {
    const { sendTxHash } = params;

    const response = await fetch(
      `${this.apiURL}/v1/status?transactionId=${sendTxHash}`
    );
    const data: StatusResponse = await response.json();

    return data;
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
}
