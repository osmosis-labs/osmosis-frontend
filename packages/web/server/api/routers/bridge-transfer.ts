import { Dec, DecUtils, PricePretty } from "@keplr-wallet/unit";
import {
  Bridge,
  BridgeCoin,
  BridgeProviders,
  getBridgeExternalUrlSchema,
  getBridgeQuoteSchema,
} from "@osmosis-labs/bridge";
import {
  DEFAULT_VS_CURRENCY,
  getAssetPrice,
  getTimeoutHeight,
} from "@osmosis-labs/server";
import { createTRPCRouter, publicProcedure } from "@osmosis-labs/trpc";
import { isNil, timeout } from "@osmosis-labs/utils";
import { CacheEntry } from "cachified";
import { LRUCache } from "lru-cache";
import { z } from "zod";

import { IS_TESTNET } from "~/config/env";

const lruCache = new LRUCache<string, CacheEntry>({
  max: 500,
});

// TODO: this should be in view layer
const BridgeLogoUrls: Record<Bridge, string> = {
  Skip: "/bridges/skip.svg",
  Squid: "/bridges/squid.svg",
  Axelar: "/bridges/axelar.svg",
  IBC: "/bridges/ibc.svg",
};

const ExternalBridgeLogoUrls: Record<Bridge, string> = {
  Skip: "/external-bridges/ibc-fun.svg",
  Squid: "/bridges/squid.svg",
  Axelar: "/external-bridges/satellite.svg",
  IBC: "/external-bridges/tfm.svg",
};

export const bridgeTransferRouter = createTRPCRouter({
  /**
   * Provide the quote for a given bridge transfer.
   */
  getQuoteByBridge: publicProcedure
    .input(getBridgeQuoteSchema.extend({ bridge: z.string() }))
    .query(async ({ input, ctx }) => {
      const bridgeProviders = new BridgeProviders(
        process.env.NEXT_PUBLIC_SQUID_INTEGRATOR_ID!,
        {
          ...ctx,
          env: IS_TESTNET ? "testnet" : "mainnet",
          cache: lruCache,
          getTimeoutHeight: ({ destinationAddress }) =>
            getTimeoutHeight({ ...ctx, destinationAddress }),
        }
      );

      const bridgeProvider =
        bridgeProviders.bridges[
          input.bridge as keyof typeof bridgeProviders.bridges
        ];

      if (!bridgeProvider) {
        throw new Error("Invalid bridge provider id: " + input.bridge);
      }

      const quoteFn = () => bridgeProvider.getQuote(input);

      /** If the bridge takes longer than 10 seconds to respond, we should timeout that quote. */
      const quote = await timeout(quoteFn, 10 * 1000)();

      // Get fiat value of:
      // 1. Expected output
      // 2. Transfer fee
      // 3. Estimated gas fee
      //
      // Getting the fiat value from quotes here
      // results in more accurate fiat prices
      // and fair competition amongst bridge providers.
      // Prices are on Osmosis, so a counterparty asset should match either the source denom in the asset list
      // or the coinMinimalDenom on Osmosis. If not on Osmosis & no match, no price is provided.
      // TODO: add coingeckoId to bridge provider assets to get price from coingecko in those cases.
      const [toAssetPrice, feeAssetPrice, gasFeeAssetPrice] = await Promise.all(
        [
          getAssetPrice({
            ...ctx,
            asset: {
              coinMinimalDenom: input.toAsset.address,
              sourceDenom: input.toAsset.address,
              chainId: input.toChain.chainId,
              address: input.toAsset.address,
            },
          }),
          getAssetPrice({
            ...ctx,
            asset: {
              coinMinimalDenom: quote.transferFee.address,
              sourceDenom: quote.transferFee.address,
              chainId: quote.transferFee.chainId,
              address: quote.transferFee.address,
            },
          }).catch(() => {
            // it's common for bridge providers to not provide correct denoms
            console.warn(
              "getQuoteByBridge: Failed to get asset price for transfer fee",
              {
                bridge: input.bridge,
                coinMinimalDenom: quote.transferFee.address,
                sourceDenom: quote.transferFee.address,
                chainId: quote.transferFee.chainId,
                address: quote.transferFee.address,
              }
            );
            return undefined;
          }),
          quote.estimatedGasFee
            ? getAssetPrice({
                ...ctx,
                asset: {
                  coinMinimalDenom: quote.estimatedGasFee.address,
                  sourceDenom: quote.estimatedGasFee.address,
                  chainId: quote.fromChain.chainId,
                  address: quote.estimatedGasFee.address,
                },
              }).catch(() => {
                // it's common for bridge providers to not provide correct denoms
                if (quote.estimatedGasFee)
                  console.warn(
                    "getQuoteByBridge: Failed to get asset price for gas fee",
                    {
                      bridge: input.bridge,
                      coinMinimalDenom: quote.estimatedGasFee.address,
                      sourceDenom: quote.estimatedGasFee.address,
                      chainId: quote.fromChain.chainId,
                      address: quote.estimatedGasFee.address,
                    }
                  );
                return undefined;
              })
            : Promise.resolve(undefined),
        ]
      );

      if (!toAssetPrice) {
        throw new Error("Invalid quote: Missing toAsset price");
      }

      /** Include decimals with decimal-included price. */
      // TODO: can move somewhere else
      const priceFromBridgeCoin = (coin: BridgeCoin, price: Dec) => {
        return new PricePretty(
          DEFAULT_VS_CURRENCY,
          new Dec(coin.amount)
            .quo(DecUtils.getTenExponentN(coin.decimals))
            .mul(price)
        );
      };

      return {
        quote: {
          provider: {
            id: bridgeProvider.providerName as Bridge,
            logoUrl: BridgeLogoUrls[bridgeProvider.providerName as Bridge],
          },
          ...quote,
          input: {
            ...quote.input,
            fiatValue: priceFromBridgeCoin(quote.input, toAssetPrice),
          },
          expectedOutput: {
            ...quote.expectedOutput,
            fiatValue: priceFromBridgeCoin(
              quote.expectedOutput,
              // output is same token as input
              toAssetPrice
            ),
          },
          transferFee: {
            ...quote.transferFee,
            fiatValue: feeAssetPrice
              ? priceFromBridgeCoin(quote.transferFee, feeAssetPrice)
              : undefined,
          },
          estimatedGasFee: quote.estimatedGasFee
            ? {
                ...quote.estimatedGasFee,
                fiatValue:
                  gasFeeAssetPrice && quote.estimatedGasFee
                    ? priceFromBridgeCoin(
                        quote.estimatedGasFee,
                        gasFeeAssetPrice
                      )
                    : undefined,
              }
            : undefined,
        },
      };
    }),

  /**
   * Provide the transfer request for a given bridge transfer.
   */
  getTransactionRequestByBridge: publicProcedure
    .input(getBridgeQuoteSchema.extend({ bridge: z.string() }))
    .query(async ({ input, ctx }) => {
      const bridgeProviders = new BridgeProviders(
        process.env.NEXT_PUBLIC_SQUID_INTEGRATOR_ID!,
        {
          ...ctx,
          env: IS_TESTNET ? "testnet" : "mainnet",
          cache: lruCache,
          getTimeoutHeight: ({ destinationAddress }) =>
            // passes testnet chains if IS_TESTNET
            getTimeoutHeight({ ...ctx, destinationAddress }),
        }
      );

      const bridgeProvider =
        bridgeProviders.bridges[
          input.bridge as keyof typeof bridgeProviders.bridges
        ];

      if (!bridgeProvider) {
        throw new Error("Invalid bridge provider id");
      }

      const quote = await bridgeProvider.getTransactionData(input);

      return {
        transactionRequest: {
          provider: {
            id: bridgeProvider.providerName,
            logoUrl: BridgeLogoUrls[bridgeProvider.providerName as Bridge],
          },
          ...quote,
        },
      };
    }),

  getExternalUrls: publicProcedure
    .input(getBridgeExternalUrlSchema)
    .query(async ({ input, ctx }) => {
      const bridgeProviders = new BridgeProviders(
        process.env.NEXT_PUBLIC_SQUID_INTEGRATOR_ID!,
        {
          ...ctx,
          env: IS_TESTNET ? "testnet" : "mainnet",
          cache: lruCache,
          getTimeoutHeight: ({ destinationAddress }) =>
            // passes testnet chains if IS_TESTNET
            getTimeoutHeight({ ...ctx, destinationAddress }),
        }
      );

      const eventualExternalUrls = await Promise.all(
        Object.values(bridgeProviders.bridges).map((bridgeProvider) =>
          timeout(
            () =>
              bridgeProvider
                .getExternalUrl(input)
                .then((externalUrl) =>
                  !isNil(externalUrl)
                    ? {
                        ...externalUrl,
                        logo: ExternalBridgeLogoUrls[
                          bridgeProvider.providerName
                        ],
                      }
                    : undefined
                )
                .catch(() => undefined),
            5_000, // 5 seconds
            `Failed to get external url for ${bridgeProvider.providerName}`
          )().catch(() => undefined)
        )
      );

      const externalUrls = eventualExternalUrls.filter(
        (externalUrl): externalUrl is NonNullable<typeof externalUrl> =>
          Boolean(externalUrl)
      );

      return {
        externalUrls,
      };
    }),
});
