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
import { ExternalInterfaceBridgeTransferMethod } from "@osmosis-labs/types";
import {
  BitcoinChainInfo,
  EthereumChainInfo,
  isNil,
  isSameVariant,
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

const ExternalBridgeLogoUrls: Record<Bridge | "Generic", string> = {
  Skip: "/bridges/skip.png",
  Squid: "/bridges/squid.svg",
  Axelar: "/external-bridges/satellite.svg",
  IBC: "/external-bridges/tfm.svg",
  Nomic: "/bridges/nomic.svg",
  Wormhole: "/external-bridges/portalbridge.svg",
  Generic: "/external-bridges/generic.svg",
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

      /**
       * Since transfer fee is deducted from input amount,
       * we overwrite the transfer fee asset to be the input
       * asset if it's the same variant.
       * This allows us to easily deduct fees from input amount
       * and find prices on Osmosis.
       */
      const feeCoin = isSameVariant(
        ctx.assetLists,
        input.fromAsset.address,
        quote.transferFee.address
      )
        ? {
            ...quote.transferFee,
            ...input.fromAsset,
            chainId: input.fromChain.chainId,
          }
        : quote.transferFee;

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
            coinGeckoId: input.toAsset.coinGeckoId,
          },
        }).catch((e) => {
          if (process.env.NODE_ENV === "development") {
            console.warn(
              "getQuoteByBridge: Failed to get asset price for toAsset, trying fromAsset",
              e,
              {
                bridge: input.bridge,
                coinMinimalDenom: input.toAsset.address,
                sourceDenom: input.toAsset.address,
                chainId: input.toChain.chainId,
                address: input.toAsset.address,
                coinGeckoId: input.toAsset.coinGeckoId,
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
              coinGeckoId: input.fromAsset.coinGeckoId,
            },
          });
        }),
        getAssetPrice({
          ...ctx,
          asset: {
            coinMinimalDenom: feeCoin.address,
            sourceDenom: feeCoin.address,
            chainId: quote.transferFee.chainId,
            address: quote.transferFee.address,
            coinGeckoId: quote.transferFee.coinGeckoId,
          },
        }).catch((e) => {
          // it's common for bridge providers to not provide correct denoms
          if (process.env.NODE_ENV === "development") {
            console.warn(
              "getQuoteByBridge: Failed to get asset price for transfer fee",
              e,
              {
                bridge: input.bridge,
                coinMinimalDenom: feeCoin.address,
                sourceDenom: feeCoin.address,
                chainId: quote.transferFee.chainId,
                address: quote.transferFee.address,
                coinGeckoId: quote.transferFee.coinGeckoId,
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
                coinGeckoId: quote.estimatedGasFee.coinGeckoId,
              },
            }).catch((e) => {
              // it's common for bridge providers to not provide correct denoms
              if (
                quote.estimatedGasFee &&
                process.env.NODE_ENV === "development"
              ) {
                console.warn(
                  "getQuoteByBridge: Failed to get asset price for gas fee",
                  e,
                  {
                    bridge: input.bridge,
                    coinMinimalDenom: quote.estimatedGasFee.address,
                    sourceDenom: quote.estimatedGasFee.address,
                    chainId: quote.fromChain.chainId,
                    address: quote.estimatedGasFee.address,
                    coinGeckoId: quote.estimatedGasFee.coinGeckoId,
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

      const transferFee = {
        amount: new CoinPretty(
          {
            coinDecimals: feeCoin.decimals,
            coinDenom: feeCoin.denom,
            coinMinimalDenom: feeCoin.address,
          },
          feeCoin.amount
        ),
        fiatValue: feeAssetPrice
          ? priceFromBridgeCoin(feeCoin, feeAssetPrice)
          : undefined,
      };

      const estimatedGasFee = quote.estimatedGasFee
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
                ? priceFromBridgeCoin(quote.estimatedGasFee, gasFeeAssetPrice)
                : undefined,
          }
        : undefined;

      let totalFeeFiatValue = estimatedGasFee?.fiatValue;
      if (transferFee?.fiatValue) {
        totalFeeFiatValue =
          totalFeeFiatValue?.add(transferFee.fiatValue) ??
          transferFee.fiatValue;
      }

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
          transferFee,
          estimatedGasFee,
          totalFeeFiatValue,
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

      const supportedAssets = await bridgeProvider.getSupportedAssets(input);

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

      const externalUrls = (
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
      ).filter((externalUrl): externalUrl is NonNullable<typeof externalUrl> =>
        Boolean(externalUrl)
      );

      // add external urls for external interfaces from asset list, as long as not already added
      const assetListFromAsset = ctx.assetLists
        .flatMap(({ assets }) => assets)
        .find((asset) => asset.coinMinimalDenom === input.fromAsset.address);
      const assetListToAsset = ctx.assetLists
        .flatMap(({ assets }) => assets)
        .find((asset) => asset.coinMinimalDenom === input.toAsset.address);

      const externalTransferMethods = (
        assetListFromAsset?.transferMethods.filter(
          ({ type }) => type === "external_interface"
        ) ?? []
      ).concat(
        assetListToAsset?.transferMethods.filter(
          ({ type }) => type === "external_interface"
        ) ?? []
      ) as ExternalInterfaceBridgeTransferMethod[];

      externalTransferMethods.forEach(
        ({ name, depositUrl: depositUrl_, withdrawUrl: withdrawUrl_ }) => {
          let depositUrl, withdrawUrl;
          try {
            depositUrl = depositUrl_ ? new URL(depositUrl_) : undefined;
          } catch {
            depositUrl = undefined;
          }
          try {
            withdrawUrl = withdrawUrl_ ? new URL(withdrawUrl_) : undefined;
          } catch {
            withdrawUrl = undefined;
          }

          let urlToAdd: (typeof externalUrls)[number] | undefined =
            input.fromChain.chainId === "osmosis-1" && withdrawUrl
              ? {
                  urlProviderName: name,
                  logo: ExternalBridgeLogoUrls["Generic"],
                  url: withdrawUrl,
                }
              : input.toChain.chainId === "osmosis-1" && depositUrl
              ? {
                  urlProviderName: name,
                  logo: ExternalBridgeLogoUrls["Generic"],
                  url: depositUrl,
                }
              : undefined;

          // ensure is not already in provider URLs before adding
          if (
            urlToAdd &&
            !externalUrls.some(
              ({ urlProviderName, url }) =>
                urlProviderName === urlToAdd.urlProviderName &&
                url.host === urlToAdd.url.host
            )
          ) {
            externalUrls.push(urlToAdd);
          }
        }
      );

      return {
        externalUrls,
      };
    }),
});
