import { CoinPretty, Dec, DecUtils, PricePretty } from "@keplr-wallet/unit";
import {
  Bridge,
  BridgeChain,
  BridgeCoin,
  BridgeProviders,
  getBridgeExternalUrlSchema,
  getBridgeQuoteSchema,
  getBridgeSupportedAssetsParams,
} from "@osmosis-labs/bridge";
import {
  DEFAULT_VS_CURRENCY,
  getAssetPrice,
  getChain,
  getTimeoutHeight,
} from "@osmosis-labs/server";
import { createTRPCRouter, publicProcedure } from "@osmosis-labs/trpc";
import {
  BitcoinChainInfo,
  EthereumChainInfo,
  isNil,
  SolanaChainInfo,
  timeout,
} from "@osmosis-labs/utils";
import { CacheEntry } from "cachified";
import { LRUCache } from "lru-cache";
import { z } from "zod";

import { IS_TESTNET } from "~/config/env";

export type BridgeChainWithDisplayInfo = (
  | Extract<BridgeChain, { chainType: "evm" }>
  | Extract<BridgeChain, { chainType: "bitcoin" }>
  | Extract<BridgeChain, { chainType: "solana" }>
  | (Extract<BridgeChain, { chainType: "cosmos" }> & { bech32Prefix: string })
) & {
  logoUri?: string;
  color?: string;
  prettyName: string;
};

const lruCache = new LRUCache<string, CacheEntry>({
  max: 500,
});

// TODO: this should be in view layer
const BridgeLogoUrls: Record<Bridge, string> = {
  Skip: "/bridges/skip.png",
  Squid: "/bridges/squid.svg",
  Axelar: "/bridges/axelar.svg",
  IBC: "/bridges/ibc.svg",
  Nomic: "/bridges/nomic.svg",
  Wormhole: "/bridges/wormhole.svg",
};

const ExternalBridgeLogoUrls: Record<Bridge, string> = {
  Skip: "/bridges/skip.png",
  Squid: "/bridges/squid.svg",
  Axelar: "/external-bridges/satellite.svg",
  IBC: "/external-bridges/tfm.svg",
  Nomic: "/bridges/nomic.svg",
  Wormhole: "/external-bridges/portalbridge.svg",
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
      const [assetPrice, feeAssetPrice, gasFeeAssetPrice] = await Promise.all([
        // since we're "bridging" the same variant, the to or from
        // asset could be used for pricing
        getAssetPrice({
          ...ctx,
          asset: {
            coinMinimalDenom: input.toAsset.address,
            sourceDenom: input.toAsset.address,
            chainId: input.toChain.chainId,
            address: input.toAsset.address,
          },
        }).catch(() => {
          if (process.env.NODE_ENV === "development") {
            console.warn(
              "getQuoteByBridge: Failed to get asset price for toAsset, trying fromAsset",
              {
                bridge: input.bridge,
                coinMinimalDenom: input.toAsset.address,
                sourceDenom: input.toAsset.address,
                chainId: input.toChain.chainId,
                address: input.toAsset.address,
              }
            );
          }
          return getAssetPrice({
            ...ctx,
            asset: {
              coinMinimalDenom: input.fromAsset.address,
              sourceDenom: input.fromAsset.address,
              chainId: input.fromChain.chainId,
              address: input.fromAsset.address,
            },
          });
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
          if (process.env.NODE_ENV === "development") {
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
          }
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
              if (
                quote.estimatedGasFee &&
                process.env.NODE_ENV === "development"
              ) {
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
              }
              return undefined;
            })
          : Promise.resolve(undefined),
      ]);

      if (!assetPrice) {
        throw new Error("Invalid quote: Missing toAsset or fromAsset price");
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
            amount: new CoinPretty(
              {
                coinDenom: quote.input.denom,
                coinMinimalDenom: quote.input.address,
                coinDecimals: quote.input.decimals,
              },
              quote.input.amount
            ),
            fiatValue: priceFromBridgeCoin(quote.input, assetPrice),
          },
          expectedOutput: {
            ...quote.expectedOutput,
            amount: new CoinPretty(
              {
                coinDecimals: quote.expectedOutput.decimals,
                coinDenom: quote.expectedOutput.denom,
                coinMinimalDenom: quote.expectedOutput.address,
              },
              quote.expectedOutput.amount
            ),
            fiatValue: priceFromBridgeCoin(
              quote.expectedOutput,
              // output is same token as input
              assetPrice
            ),
          },
          transferFee: {
            amount: new CoinPretty(
              {
                coinDecimals: quote.transferFee.decimals,
                coinDenom: quote.transferFee.denom,
                coinMinimalDenom: quote.transferFee.address,
              },
              quote.transferFee.amount
            ),
            fiatValue: feeAssetPrice
              ? priceFromBridgeCoin(quote.transferFee, feeAssetPrice)
              : undefined,
          },
          estimatedGasFee: quote.estimatedGasFee
            ? {
                amount: new CoinPretty(
                  {
                    coinDecimals: quote.estimatedGasFee.decimals,
                    coinDenom: quote.estimatedGasFee.denom,
                    coinMinimalDenom: quote.estimatedGasFee.address,
                  },
                  quote.estimatedGasFee.amount
                ),
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

  getSupportedAssetsByBridge: publicProcedure
    .input(getBridgeSupportedAssetsParams.extend({ bridge: z.string() }))
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

      const supportedAssetFn = () => bridgeProvider.getSupportedAssets(input);

      /** If the bridge takes longer than 10 seconds to respond, we should timeout that query. */
      const supportedAssets = await timeout(supportedAssetFn, 10 * 1000)();

      const assetsByChainId = supportedAssets.reduce<
        Record<
          BridgeChain["chainId"],
          ((typeof supportedAssets)[number] & { providerName: string })[]
        >
      >((acc, chainAsset) => {
        if (!acc[chainAsset.chainId]) {
          acc[chainAsset.chainId] = [];
        }

        acc[chainAsset.chainId].push({
          ...chainAsset,
          providerName: input.bridge,
        });

        return acc;
      }, {});

      const uniqueChains = Array.from(
        // Remove duplicate chains
        new Map(
          supportedAssets.map(({ chainId, chainType }) => [
            chainId,
            { chainId, chainType },
          ])
        ).values()
      );

      const availableChains = uniqueChains
        .map(({ chainId, chainType }) => {
          if (chainType === "evm") {
            const evmChain = Object.values(EthereumChainInfo).find(
              (chain) => chain.id === chainId
            );

            if (!evmChain) {
              return undefined;
            }

            return {
              prettyName: evmChain.name,
              chainName: evmChain.chainName,
              chainId: evmChain.id,
              chainType,
              logoUri: evmChain.relativeLogoUrl,
              color: evmChain.color,
            } as Extract<BridgeChainWithDisplayInfo, { chainType: "evm" }>;
          } else if (chainType === "cosmos") {
            let cosmosChain: ReturnType<typeof getChain> | undefined;
            try {
              cosmosChain = getChain({
                chainList: ctx.chainList,
                chainNameOrId: String(chainId),
              });
            } catch {}

            if (!cosmosChain) {
              return undefined;
            }

            return {
              prettyName: cosmosChain.pretty_name,
              chainId: cosmosChain.chain_id,
              chainName: cosmosChain.chain_name,
              chainType,
              logoUri: cosmosChain.logoURIs?.svg ?? cosmosChain.logoURIs?.png,
              color: cosmosChain.logoURIs?.theme?.primary_color_hex,
              bech32Prefix: cosmosChain.bech32_prefix,
            } as Extract<BridgeChainWithDisplayInfo, { chainType: "cosmos" }>;
          } else if (chainType === "bitcoin") {
            return {
              ...BitcoinChainInfo,
              chainType,
              logoUri: "/networks/bitcoin.svg",
            } as Extract<BridgeChainWithDisplayInfo, { chainType: "bitcoin" }>;
          } else if (chainType === "solana") {
            return {
              ...SolanaChainInfo,
              chainType,
              logoUri: "/networks/solana.svg",
            } as Extract<BridgeChainWithDisplayInfo, { chainType: "solana" }>;
          }

          return undefined;
        })
        .filter((chain): chain is NonNullable<typeof chain> => Boolean(chain));

      return {
        supportedAssets: {
          providerName: bridgeProvider.providerName as Bridge,
          inputAssetAddress: input.asset.address,
          assetsByChainId,
          availableChains,
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
    .input(
      getBridgeExternalUrlSchema.merge(
        z.object({
          bridges: z.array(z.string()).optional(),
        })
      )
    )
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

      const bridgesToQuery = input.bridges
        ? input.bridges.map(
            (bridge) =>
              bridgeProviders.bridges[
                bridge as keyof typeof bridgeProviders.bridges
              ]
          )
        : Object.values(bridgeProviders.bridges);

      return {
        externalUrls: (
          await Promise.all(
            bridgesToQuery.map((bridgeProvider) =>
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
          )
        ).filter(
          (externalUrl): externalUrl is NonNullable<typeof externalUrl> =>
            Boolean(externalUrl)
        ),
      };
    }),
});
