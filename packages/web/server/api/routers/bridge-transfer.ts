import {
  Bridge,
  BridgeChain,
  BridgeCoin,
  BridgeProviders,
  getBridgeExternalUrlSchema,
  getBridgeQuoteSchema,
  getBridgeSupportedAssetsParams,
  getDepositAddressParamsSchema,
} from "@osmosis-labs/bridge";
import {
  DEFAULT_VS_CURRENCY,
  getAssetPrice,
  getCachedTransmuterTotalPoolLiquidity,
  getChain,
  getTimeoutHeight,
} from "@osmosis-labs/server";
import {
  createTRPCRouter,
  publicProcedure,
  UserOsmoAddressSchema,
} from "@osmosis-labs/trpc";
import { isInsufficientFeeError } from "@osmosis-labs/tx";
import { ExternalInterfaceBridgeTransferMethod } from "@osmosis-labs/types";
import { CoinPretty, Dec, DecUtils, PricePretty } from "@osmosis-labs/unit";
import {
  BitcoinCashChainInfo,
  BitcoinChainInfo,
  DogecoinChainInfo,
  EthereumChainInfo,
  getnBTCMinimalDenom,
  isNil,
  isSameVariant,
  LitecoinChainInfo,
  PenumbraChainInfo,
  SolanaChainInfo,
  timeout,
  TonChainInfo,
  TronChainInfo,
  XrplChainInfo,
} from "@osmosis-labs/utils";
import { TRPCError } from "@trpc/server";
import { CacheEntry } from "cachified";
import { LRUCache } from "lru-cache";
import { z } from "zod";

import { IS_TESTNET } from "~/config/env";
import {
  getAlloyConstituentExternalInterfaceMethods,
  getSuppressedAlloyExternalInterfaceNames,
} from "~/server/api/routers/bridge/external-url-constituents";
import { resolveExternalUrlConvertVariant } from "~/server/api/routers/bridge/external-url-convert-variant";
import { BridgeLogoUrls, ExternalBridgeLogoUrls } from "~/utils/bridge";
import { INSUFFICIENT_FEE_TOKENS_OSMOSIS_MARKER } from "~/utils/error";

export type BridgeChainWithDisplayInfo = (
  | Extract<BridgeChain, { chainType: "evm" }>
  | Extract<BridgeChain, { chainType: "bitcoin" }>
  | Extract<BridgeChain, { chainType: "solana" }>
  | Extract<BridgeChain, { chainType: "penumbra" }>
  | (Extract<BridgeChain, { chainType: "cosmos" }> & { bech32Prefix: string })
  | Extract<BridgeChain, { chainType: "tron" }>
  | Extract<BridgeChain, { chainType: "doge" }>
  | Extract<BridgeChain, { chainType: "bitcoin-cash" }>
  | Extract<BridgeChain, { chainType: "litecoin" }>
  | Extract<BridgeChain, { chainType: "xrpl" }>
  | Extract<BridgeChain, { chainType: "ton" }>
) & {
  logoUri?: string;
  color?: string;
  prettyName: string;
};

const lruCache = new LRUCache<string, CacheEntry>({
  max: 500,
});

/** Include decimals with decimal-included price. */
const priceFromBridgeCoin = (coin: BridgeCoin, price: Dec) => {
  return new PricePretty(
    DEFAULT_VS_CURRENCY,
    new Dec(coin.amount).quo(DecUtils.getTenExponentN(coin.decimals)).mul(price)
  );
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
          getTimeoutHeight: (params) => getTimeoutHeight({ ...ctx, ...params }),
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

      let quote: Awaited<ReturnType<typeof quoteFn>>;
      try {
        /** If the bridge takes longer than 15 seconds to respond, we should timeout that quote. */
        quote = await timeout(quoteFn, 15 * 1000)();
      } catch (err) {
        // For Osmosis-source withdrawals, the bridge provider's quote may fail
        // because the user holds no fee token with sufficient balance to cover
        // the simulated gas (e.g. ATOM fee token whose txfees routing pool has
        // no liquidity). Surface this as a typed TRPCError so the client can
        // render the dedicated "No fee tokens" warning instead of the generic
        // "Something isn't working" box.
        const errorMessage =
          err instanceof Error
            ? err.message
            : typeof err === "string"
            ? err
            : "";
        const isOsmosisWithdrawal = input.fromChain.chainId === "osmosis-1";
        if (isOsmosisWithdrawal && isInsufficientFeeError(errorMessage)) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: `${INSUFFICIENT_FEE_TOKENS_OSMOSIS_MARKER}: ${errorMessage}`,
            cause: err,
          });
        }
        throw err;
      }

      // Basic circuit breaker to validate some invariants
      // from input + given quote
      if (input.fromAsset.address !== quote.input.address) {
        throw new Error(
          `Invalid quote: Expected fromAsset address ${input.fromAsset.address} but got ${quote.input.address} in quote`
        );
      }

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
            denom: quote.transferFee.denom ?? input.fromAsset.denom,
            decimals: quote.transferFee.decimals ?? input.fromAsset.decimals,
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
              chainId: input.fromChain.chainId,
              address: input.fromAsset.address,
              coinGeckoId: input.fromAsset.coinGeckoId,
            },
          }).catch((e) => {
            if (process.env.NODE_ENV === "development") {
              console.warn(
                "getQuoteByBridge: Failed to get asset price for fromAsset",
                e
              );
            }
            return undefined;
          });
        }),
        getAssetPrice({
          ...ctx,
          asset: {
            coinMinimalDenom: feeCoin.address,
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
                sourceDenom: quote.estimatedGasFee.address,
                coinMinimalDenom: quote.estimatedGasFee.address,
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

      console.log(assetPrice, feeAssetPrice, gasFeeAssetPrice);

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
            fiatValue: assetPrice
              ? priceFromBridgeCoin(quote.input, assetPrice)
              : undefined,
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
            fiatValue: assetPrice
              ? priceFromBridgeCoin(
                  quote.expectedOutput,
                  // output is same token as input
                  assetPrice
                )
              : undefined,
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
          getTimeoutHeight: (params) => getTimeoutHeight({ ...ctx, ...params }),
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
            const evmChain = EthereumChainInfo.find(
              (chain) => chain.id === chainId
            );

            if (!evmChain) {
              return undefined;
            }

            return {
              prettyName: evmChain.name,
              chainName: evmChain.name,
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
              prettyName: cosmosChain.prettyName,
              chainId: cosmosChain.chain_id,
              chainName: cosmosChain.chain_name,
              chainType,
              logoUri: cosmosChain.logo_URIs?.svg ?? cosmosChain.logo_URIs?.png,
              // color: cosmosChain.logo_URIs?.theme?.primary_color_hex,
              bech32Prefix: cosmosChain.bech32Prefix,
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
          } else if (chainType === "tron") {
            return {
              ...TronChainInfo,
              chainType,
              logoUri: "/networks/tron.svg",
            };
          } else if (chainType === "penumbra") {
            return {
              ...PenumbraChainInfo,
              chainType,
              logoUri: "/networks/penumbra.svg",
            };
          } else if (chainType === "doge") {
            return {
              ...DogecoinChainInfo,
              chainType,
              logoUri: "/networks/dogecoin.svg",
            };
          } else if (chainType === "bitcoin-cash") {
            return {
              ...BitcoinCashChainInfo,
              chainType,
              logoUri: "/networks/bitcoin-cash.svg",
            };
          } else if (chainType === "litecoin") {
            return {
              ...LitecoinChainInfo,
              chainType,
              logoUri: "/networks/litecoin.svg",
            };
          } else if (chainType === "xrpl") {
            return {
              ...XrplChainInfo,
              chainType,
              logoUri: "/networks/xrpl.svg",
            };
          } else if (chainType === "ton") {
            return {
              ...TonChainInfo,
              chainType,
              logoUri: "/networks/ton.svg",
            };
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
          getTimeoutHeight: (params) => getTimeoutHeight({ ...ctx, ...params }),
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
          getTimeoutHeight: (params) => getTimeoutHeight({ ...ctx, ...params }),
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

      const allAssetListAssets = ctx.assetLists.flatMap(({ assets }) => assets);

      // add external urls for external interfaces from asset list, as long as not already added
      const assetListFromAsset = allAssetListAssets.find(
        (asset) => asset.coinMinimalDenom === input.fromAsset?.address
      );
      const assetListToAsset = allAssetListAssets.find(
        (asset) => asset.coinMinimalDenom === input.toAsset?.address
      );

      // Resolve the TRUE pool-member denom set for whichever side is an alloy.
      // `variantGroupKey` only groups variants for display; it is NOT pool
      // membership, so a grouped sibling (e.g. BTC.int3 for allBTC) can fail to
      // be a real constituent the user can obtain from the alloy. We read the
      // alloy's transmuter pool composition (`get_total_pool_liquidity` on its
      // `contract`, cached 30s) and gate the family by it. Only fired when the
      // side is actually an alloyed asset with a contract, so this stays on the
      // fallback / convert path rather than every bridge view.
      const resolveAlloyMemberDenoms = async (
        alloyAsset: typeof assetListFromAsset
      ): Promise<Set<string>> => {
        if (!alloyAsset?.isAlloyed || !alloyAsset.contract) return new Set();
        try {
          const liquidity = await getCachedTransmuterTotalPoolLiquidity(
            alloyAsset.contract,
            ctx.chainList,
            ctx.assetLists
          );
          return new Set(liquidity.map(({ asset }) => asset.coinMinimalDenom));
        } catch {
          // On a failed membership read, surface nothing rather than risk
          // offering a non-constituent (dead) route.
          return new Set();
        }
      };

      const [fromAlloyMemberDenoms, toAlloyMemberDenoms] = await Promise.all([
        resolveAlloyMemberDenoms(assetListFromAsset),
        resolveAlloyMemberDenoms(assetListToAsset),
      ]);

      // When the user transfers an alloy (the from-asset on a withdraw, the
      // to-asset on a deposit), aggregate the `external_interface` methods of
      // the alloy's constituent variants too, not just the alloy's own. An
      // alloy such as allBTC carries no transfer methods of its own, so without
      // this a down quote route leaves no external fallback even though the
      // constituents carry usable bridge URLs. The helper is gated by true pool
      // membership (above), so non-constituent group siblings are never
      // surfaced, and direction-halted constituents are skipped inside it. Dedup
      // by provider name / host is handled below, so constituent methods that
      // collide with the alloy's own (e.g. Sologenic on both allXRP and
      // XRP.coreum) are collapsed.
      const constituentExternalMethods = [
        ...getAlloyConstituentExternalInterfaceMethods({
          alloy: assetListFromAsset,
          assets: allAssetListAssets,
          direction: "withdraw",
          memberDenoms: fromAlloyMemberDenoms,
        }),
        ...getAlloyConstituentExternalInterfaceMethods({
          alloy: assetListToAsset,
          assets: allAssetListAssets,
          direction: "deposit",
          memberDenoms: toAlloyMemberDenoms,
        }),
      ];

      // An alloy can carry an `external_interface` of its own that is really a
      // constituent connector by another name (e.g. allXRP's own Sologenic
      // link). Those alloy-own methods have no halt flag or variant link, so the
      // membership/halt gate above can't see them. Suppress an alloy-own method
      // whose provider name belongs to a gated (non-member or halted) sibling
      // and no reachable sibling — otherwise it would defeat the gate (and win
      // the dedup over the dropped constituent copy).
      const [fromSuppressedNames, toSuppressedNames] = [
        getSuppressedAlloyExternalInterfaceNames({
          alloy: assetListFromAsset,
          assets: allAssetListAssets,
          direction: "withdraw",
          memberDenoms: fromAlloyMemberDenoms,
        }),
        getSuppressedAlloyExternalInterfaceNames({
          alloy: assetListToAsset,
          assets: allAssetListAssets,
          direction: "deposit",
          memberDenoms: toAlloyMemberDenoms,
        }),
      ];

      const externalTransferMethods = (
        (assetListFromAsset?.transferMethods.filter(
          (method) =>
            method.type === "external_interface" &&
            !fromSuppressedNames.has(method.name)
        ) ?? []) as ExternalInterfaceBridgeTransferMethod[]
      )
        .concat(
          (assetListToAsset?.transferMethods.filter(
            (method) =>
              method.type === "external_interface" &&
              !toSuppressedNames.has(method.name)
          ) ?? []) as ExternalInterfaceBridgeTransferMethod[]
        )
        .concat(constituentExternalMethods);

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
            input.fromChain?.chainId === "osmosis-1" && withdrawUrl
              ? {
                  urlProviderName: name,
                  logo: ExternalBridgeLogoUrls["Generic"],
                  url: withdrawUrl,
                }
              : input.toChain?.chainId === "osmosis-1" && depositUrl
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
                urlProviderName === urlToAdd.urlProviderName ||
                url.host === urlToAdd.url.host
            )
          ) {
            externalUrls.push(urlToAdd);
          }
        }
      );

      // For an alloy withdrawal, a third-party external-interface site (e.g.
      // Sologenic for allXRP, Picasso for allSOL) only recognises a specific
      // bridge *variant* (XRP.coreum, SOL.pica), not the alloy denom the user
      // holds. Resolve, per external URL, the sibling variant whose own
      // `external_interface` carries the same provider name, so the client can
      // convert alloy -> variant before opening the URL. Data-driven via the
      // alloy's variantGroupKey; no per-site hardcoding.
      const withdrawAlloy =
        input.fromChain?.chainId === "osmosis-1"
          ? assetListFromAsset ?? null
          : null;

      const externalUrlsWithConvert = externalUrls.map((externalUrl) => ({
        ...externalUrl,
        convertToVariant: resolveExternalUrlConvertVariant({
          urlProviderName: externalUrl.urlProviderName,
          alloy: withdrawAlloy,
          assets: allAssetListAssets,
          // The convert target must be a true pool member of the withdrawn
          // alloy; a grouped non-constituent cannot be obtained from it.
          memberDenoms: fromAlloyMemberDenoms,
        }),
      }));

      return {
        externalUrls: externalUrlsWithConvert,
      };
    }),

  /**
   * Provide the deposit address for a given bridge transfer.
   */
  getDepositAddress: publicProcedure
    .input(getDepositAddressParamsSchema.extend({ bridge: z.string() }))
    .query(async ({ input, ctx }) => {
      const bridgeProviders = new BridgeProviders(
        process.env.NEXT_PUBLIC_SQUID_INTEGRATOR_ID!,
        {
          ...ctx,
          env: IS_TESTNET ? "testnet" : "mainnet",
          cache: lruCache,
          getTimeoutHeight: (params) => getTimeoutHeight({ ...ctx, ...params }),
        }
      );

      const bridgeProvider =
        bridgeProviders.bridges[
          input.bridge as keyof typeof bridgeProviders.bridges
        ];

      if (!bridgeProvider) {
        throw new Error("Invalid bridge provider id: " + input.bridge);
      }

      if (!("getDepositAddress" in bridgeProvider)) {
        throw new Error("Bridge does not support deposit addresses");
      }

      const depositData = await bridgeProvider.getDepositAddress({
        toAddress: input.toAddress,
        fromChain: input.fromChain,
        fromAsset: input.fromAsset,
        toAsset: input.toAsset,
        toChain: input.toChain,
      });

      if (!depositData) {
        throw new Error("Failed to get deposit address");
      }

      const [assetPrice, feeAssetPrice] = await Promise.all([
        getAssetPrice({
          ...ctx,
          asset: {
            coinMinimalDenom: depositData.minimumDeposit.address,
            address: depositData.minimumDeposit.address,
            coinGeckoId: depositData.minimumDeposit.coinGeckoId,
          },
        }),
        getAssetPrice({
          ...ctx,
          asset: {
            coinMinimalDenom: depositData.networkFee.address,
            address: depositData.networkFee.address,
            coinGeckoId: depositData.networkFee.coinGeckoId,
          },
        }),
      ]);

      return {
        depositData: {
          ...depositData,
          minimumDeposit: {
            amount: new CoinPretty(
              {
                coinDecimals: depositData.minimumDeposit.decimals,
                coinDenom: depositData.minimumDeposit.denom,
                coinMinimalDenom: depositData.minimumDeposit.address,
                coinGeckoId: depositData.minimumDeposit.coinGeckoId,
              },
              new Dec(depositData.minimumDeposit.amount)
            ),
            fiatValue: assetPrice
              ? priceFromBridgeCoin(depositData.minimumDeposit, assetPrice)
              : undefined,
          },
          networkFee: {
            amount: new CoinPretty(
              {
                coinDecimals: depositData.networkFee.decimals,
                coinDenom: depositData.networkFee.denom,
                coinMinimalDenom: depositData.networkFee.address,
                coinGeckoId: depositData.networkFee.coinGeckoId,
              },
              new Dec(depositData.networkFee.amount)
            ),
            fiatValue: feeAssetPrice
              ? priceFromBridgeCoin(depositData.networkFee, feeAssetPrice)
              : undefined,
          },
        },
      };
    }),

  getNomicPendingDeposits: publicProcedure
    .input(UserOsmoAddressSchema.required())
    .query(async ({ input, ctx }) => {
      const bridgeProviders = new BridgeProviders(
        process.env.NEXT_PUBLIC_SQUID_INTEGRATOR_ID!,
        {
          ...ctx,
          env: IS_TESTNET ? "testnet" : "mainnet",
          cache: lruCache,
          getTimeoutHeight: (params) => getTimeoutHeight({ ...ctx, ...params }),
        }
      );

      const nomicBridgeProvider = bridgeProviders.bridges.Nomic;

      const pendingDeposits = await nomicBridgeProvider.getPendingDeposits({
        address: input.userOsmoAddress,
      });

      const btcMinimalDenom = IS_TESTNET
        ? getnBTCMinimalDenom({ env: "testnet" })
        : "factory/osmo1z6r6qdknhgsc0zeracktgpcxf43j6sekq07nw8sxduc9lg0qjjlqfu25e3/alloyed/allBTC";

      const btcPrice = await getAssetPrice({
        ...ctx,
        asset: {
          coinMinimalDenom: btcMinimalDenom,
        },
      });

      return {
        pendingDeposits: pendingDeposits.map((deposit) => {
          const amount = new Dec(deposit.amount);

          return {
            ...deposit,
            userOsmoAddress: input.userOsmoAddress,
            amount: new CoinPretty(
              {
                coinDecimals: deposit.networkFee.decimals,
                coinDenom: deposit.networkFee.denom,
                coinMinimalDenom: deposit.networkFee.address,
                coinGeckoId: deposit.networkFee.coinGeckoId,
              },
              amount
            ),
            fiatValue: new PricePretty(
              DEFAULT_VS_CURRENCY,
              btcPrice.mul(
                amount.quo(
                  DecUtils.getTenExponentN(deposit.networkFee.decimals)
                )
              )
            ),
            networkFee: {
              amount: new CoinPretty(
                {
                  coinDecimals: deposit.networkFee.decimals,
                  coinDenom: deposit.networkFee.denom,
                  coinMinimalDenom: deposit.networkFee.address,
                  coinGeckoId: deposit.networkFee.coinGeckoId,
                },
                new Dec(deposit.networkFee.amount)
              ),
              fiatValue: btcPrice
                ? priceFromBridgeCoin(deposit.networkFee, btcPrice)
                : undefined,
            },
            providerFee: {
              amount: new CoinPretty(
                {
                  coinDecimals: deposit.providerFee.decimals,
                  coinDenom: deposit.providerFee.denom,
                  coinMinimalDenom: deposit.providerFee.address,
                  coinGeckoId: deposit.providerFee.coinGeckoId,
                },
                new Dec(deposit.providerFee.amount)
              ),
              fiatValue: btcPrice
                ? priceFromBridgeCoin(deposit.providerFee, btcPrice)
                : undefined,
            },
          };
        }),
      };
    }),
});
