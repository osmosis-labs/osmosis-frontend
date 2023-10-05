import type {
  ChainsResponse,
  SdkInfoResponse,
  StatusResponse,
  TokensResponse,
} from "@0xsquid/sdk";
import { AxelarQueryAPI, Environment } from "@axelar-network/axelarjs-sdk";
import { CoinPretty } from "@keplr-wallet/unit";
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

const providerName = "Axelar" as const;
export class AxelarBridgeProvider implements BridgeProvider {
  static providerName = providerName;
  static logoUrl = "/bridges/axelar.svg";
  client = new AxelarQueryAPI({ environment: Environment.MAINNET });

  providerName = providerName;

  constructor(
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
      getFreshValue: async (): Promise<any> => {
        try {
          const amount = new CoinPretty(
            {
              coinDecimals: fromAsset.decimals,
              coinDenom: fromAsset.denom,
              coinMinimalDenom: fromAsset.minimalDenom ?? fromAsset.denom,
            },
            fromAmount
          ).toCoin().amount;

          const transferFeeRes = await this.client.getTransferFee(
            String(fromChain.chainId),
            String(toChain.chainId),
            fromAsset.address,
            Number(amount)
          );
          const gasCostRes = await this.client.getNativeGasBaseFee(
            String(fromChain.chainId),
            String(toChain.chainId)
          );

          if (!transferFeeRes.fee || !gasCostRes.baseFee) {
            throw new BridgeQuoteError([
              {
                errorType: "Unsupported Quote",
                message: "Axelar Bridge doesn't support this quote",
              },
            ]);
          }

          return {
            transferFeeRes,
            gasCostRes,
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
