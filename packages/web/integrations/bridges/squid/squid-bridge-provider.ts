import type {
  ChainsResponse,
  GetRoute as SquidGetRouteParams,
  RouteResponse,
  SdkInfoResponse,
  StatusResponse,
  TokensResponse,
} from "@0xsquid/sdk";
import { CacheEntry, cachified } from "cachified";
import { LRUCache } from "lru-cache";

import {
  BridgeAsset,
  BridgeChain,
  BridgeProvider,
  BridgeQuote,
  BridgeQuoteError,
  BridgeStatus,
  GetBridgeQuoteParams,
} from "../base";

const providerName = "Squid" as const;
export class SquidBridgeProvider implements BridgeProvider {
  static providerName = providerName;
  static logoUrl = "/bridges/squid.svg";

  providerName = providerName;

  constructor(
    readonly integratorId: string,
    readonly apiURL = "https://api.0xsquid.com",
    readonly cache = new LRUCache<string, CacheEntry>({
      max: 200,
    })
  ) {}

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
      cache: this.cache,
      key: JSON.stringify({
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
        const url = new URL(`${this.apiURL}/v1/route`);

        const getRouteParams: SquidGetRouteParams = {
          fromChain: fromChain.chainId.toString(),
          toChain: toChain.chainId.toString(),
          fromAddress,
          toAddress,
          fromAmount: fromAmount.toString(),
          fromToken: fromAsset.address,
          toToken: toAsset.address,
          slippage,
          quoteOnly: false,
        };

        Object.entries(getRouteParams).forEach(([key, value]) => {
          url.searchParams.append(key, value.toString());
        });

        try {
          const response = await fetch(url.toString(), {
            headers: {
              "x-integrator-id": this.integratorId,
            },
          });
          const data: RouteResponse = await response.json();
          if (!response.ok) {
            throw data;
          }

          const {
            fromAmount: estimateFromAmount,
            toAmount,
            toAmountMin,
            feeCosts,
            estimatedRouteDuration,
            gasCosts,
          } = data.route.estimate;

          if (feeCosts.length > 1 || gasCosts.length > 1) {
            throw new BridgeQuoteError([
              {
                errorType: "Unsupported Quote",
                message:
                  "Osmosis FrontEnd only supports a single fee and gas costs",
              },
            ]);
          }

          return {
            fromAmount: estimateFromAmount,
            toAmount: toAmount,
            toAmountMin: toAmountMin,
            transferFee: {
              denom: feeCosts[0].token.symbol,
              amount: feeCosts[0].amount,
              decimals: feeCosts[0].token.decimals,
              coinMinimalDenom: feeCosts[0].token.symbol,
            },
            estimatedTime: estimatedRouteDuration,
            estimatedGasFee: {
              denom: gasCosts[0].token.symbol,
              amount: gasCosts[0].amount,
              decimals: gasCosts[0].token.decimals,
              coinMinimalDenom: gasCosts[0].token.symbol,
            },
            transactionRequest: data.route.transactionRequest!,
          };
        } catch (e) {
          const error = e as
            | {
                errors: { errorType?: string; message?: string }[];
              }
            | BridgeQuoteError;

          if (error instanceof BridgeQuoteError) {
            throw error;
          }

          throw new BridgeQuoteError(
            error.errors?.map(({ errorType, message }) => ({
              errorType: errorType ?? "Unknown Error",
              message: message ?? "",
            }))
          );
        }
      },
      ttl: 20 * 1000, // 20 seconds,
    });
  }

  async getStatus(): Promise<BridgeStatus> {
    return cachified({
      cache: this.cache,
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
      cache: this.cache,
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
      cache: this.cache,
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
}
