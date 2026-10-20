import type { AssetList, Chain, MinimalAsset } from "@osmosis-labs/types";
import { CoinPretty, Dec, PricePretty, RatePretty } from "@osmosis-labs/unit";
import cachified, { type CacheEntry } from "cachified";
import { LRUCache } from "lru-cache";

import {
  DATA_SERVICES_MARKET_MAX_AGE,
  DEFAULT_LRU_OPTIONS,
} from "../../../utils/cache";
import { captureErrorAndReturn, captureIfError } from "../../../utils/error";
import {
  type CoingeckoVsCurrencies,
  queryCoingeckoCoin,
  queryCoingeckoCoinIds,
} from "../../coingecko";
import { querySupplyTotal } from "../../cosmos";
import { queryAllTokenData, type TokenData } from "../../data-services";
import { type AssetFilter, getAssets } from ".";
import { DEFAULT_VS_CURRENCY } from "./config";
import { getCoinGeckoPricesBatchLoader } from "./price/providers/coingecko";

export type AssetMarketInfo = Partial<{
  marketCap: PricePretty;
  totalSupply: CoinPretty;
  currentPrice: PricePretty;
  priceChange1h: RatePretty;
  priceChange24h: RatePretty;
  priceChange7d: RatePretty;
  volume24h: PricePretty;
  liquidity: PricePretty;
}>;

const marketInfoCache = new LRUCache<string, CacheEntry>(DEFAULT_LRU_OPTIONS);
/** Cached function that returns an asset with market info included. */
export async function getMarketAsset<TAsset extends MinimalAsset>({
  asset,
  includeTotalSupply = false,
  ...params
}: {
  assetLists: AssetList[];
  chainList: Chain[];
  asset: TAsset;
  includeTotalSupply?: boolean;
}): Promise<TAsset & AssetMarketInfo> {
  const assetMarket = await cachified({
    cache: marketInfoCache,
    key: `market-asset-${asset.coinMinimalDenom}-${includeTotalSupply}`,
    ttl: 1000 * 60, // 1 minute
    getFreshValue: async ({ metadata }) => {
      const [marketActivity, totalSupply] = await Promise.all([
        getAssetMarketActivityWithFreshness(asset).catch((e) => {
          // Market data is unavailable, not absent: retry soon instead of
          // holding the asset without it for the full ttl.
          metadata.ttl = 1000 * 5; // 5 seconds
          return captureErrorAndReturn(e, undefined);
        }),
        includeTotalSupply
          ? querySupplyTotal({
              ...params,
              denom: asset.coinMinimalDenom,
            }).catch((e) => captureErrorAndReturn(e, undefined))
          : undefined,
      ]);
      const assetMarketActivity = marketActivity?.activity;

      // Never hold a price past the token data's freshness, and retry soon when
      // there's no price (it may be unavailable rather than absent).
      if (marketActivity) {
        metadata.ttl = assetMarketActivity?.price
          ? Math.min(1000 * 60, marketActivity.freshForMs)
          : 1000 * 5;
      }

      return {
        currentPrice: assetMarketActivity?.price,
        marketCap: assetMarketActivity?.marketCap,
        totalSupply: totalSupply
          ? new CoinPretty(asset, totalSupply.amount.amount)
          : undefined,
        liquidity: assetMarketActivity?.liquidity,
        priceChange1h: assetMarketActivity?.price1hChange,
        priceChange24h: assetMarketActivity?.price24hChange,
        priceChange7d: assetMarketActivity?.price7dChange,
        volume24h: assetMarketActivity?.volume24h,
      };
    },
  });

  return { ...asset, ...assetMarket };
}

/** Maps and adds general supplementary market data such as current price and market cap to the given type.
 *  If no assets provided, they will be fetched and passed the given search params. */
export async function mapGetMarketAssets<TAsset extends MinimalAsset>({
  assets,
  excludeVariants = false,
  excludeStablecoins = false,
  minLiquidity,
  minVolume24h,
  maxPriceChange24h,
  ...params
}: {
  assetLists: AssetList[];
  chainList: Chain[];
  assets?: TAsset[];
  /** Exclude non-canonical variants (keep only assets where variantGroupKey === coinMinimalDenom). Defaults to false. */
  excludeVariants?: boolean;
  /** Exclude stablecoins (assets with "stablecoin" category). Defaults to false. */
  excludeStablecoins?: boolean;
  /** Minimum liquidity threshold in USD. If provided, only assets with liquidity >= this value will be included. */
  minLiquidity?: number;
  /** Minimum 24h volume threshold in USD. If provided, only assets with volume24h >= this value will be included. */
  minVolume24h?: number;
  /** Maximum 24h price change in percent. If provided, assets with priceChange24h above this are excluded (sanity cap for stale data / shallow-pool blips). */
  maxPriceChange24h?: number;
} & AssetFilter): Promise<(TAsset & AssetMarketInfo)[]> {
  // Without market data every asset would be filtered out below, which would read
  // as an empty list rather than an outage.
  if (!(await isMarketDataAvailable())) {
    throw new Error("Market data is unavailable");
  }

  if (!assets) assets = getAssets({ ...params }) as TAsset[];

  // Apply variant filtering if requested
  if (excludeVariants) {
    assets = assets.filter((asset) => {
      // Keep assets that don't have a variant group, or are the canonical variant
      return (
        !asset.variantGroupKey ||
        asset.variantGroupKey === asset.coinMinimalDenom
      );
    });
  }

  // Apply stablecoin filtering if requested
  if (excludeStablecoins) {
    // Create a map for efficient category lookups
    const assetCategoryMap = new Map(
      params.assetLists
        .flatMap(({ assets }) => assets)
        .map((asset) => [asset.coinMinimalDenom, asset.categories])
    );

    assets = assets.filter((asset) => {
      const categories = assetCategoryMap.get(asset.coinMinimalDenom);
      return !categories?.includes("stablecoin");
    });
  }

  const marketAssets = await Promise.all(
    assets.map((asset) => getMarketAsset({ asset, ...params }))
  );

  // Filter for assets that meet liquidity and volume requirements
  return marketAssets.filter((asset) => {
    const liquidityDec = asset.liquidity?.toDec() ?? new Dec(0);

    if (minLiquidity !== undefined) {
      if (!liquidityDec.gte(new Dec(minLiquidity))) return false;
    } else if (!liquidityDec.isPositive()) {
      return false;
    }

    if (minVolume24h !== undefined) {
      const volumeDec = asset.volume24h?.toDec() ?? new Dec(0);
      if (!volumeDec.gte(new Dec(minVolume24h))) return false;
    }

    if (maxPriceChange24h !== undefined && asset.priceChange24h) {
      // RatePretty stores rates as fractions (50% => 0.5), so the percent
      // cap is divided by 100 before comparison.
      const cap = new Dec(maxPriceChange24h).quo(new Dec(100));
      if (asset.priceChange24h.toDec().gt(cap)) return false;
    }

    return true;
  });
}

const assetCoingeckoCoinCache = new LRUCache<string, CacheEntry>(
  DEFAULT_LRU_OPTIONS
);

/** Fetches coingecko coin data. */
export async function getAssetCoingeckoCoin({
  coinGeckoId,
  currency = "usd",
}: {
  coinGeckoId: string;
  currency?: CoingeckoVsCurrencies;
}) {
  return cachified({
    cache: assetCoingeckoCoinCache,
    key: `assetCoingeckoCoinCache-${coinGeckoId}-${currency}`,
    ttl: 1000 * 60 * 30, // 15 minutes
    getFreshValue: async () => {
      const [coingeckoCoin, volumes] = await Promise.all([
        captureIfError(() => queryCoingeckoCoin(coinGeckoId)),
        captureIfError(() =>
          getCoinGeckoPricesBatchLoader({
            currency,
          })
        ),
      ]);

      const volume24h = volumes
        ? (await volumes.load(coinGeckoId)).volume24h
        : undefined;

      return {
        links: coingeckoCoin?.links,
        marketCapRank: coingeckoCoin?.market_cap_rank,
        totalValueLocked: coingeckoCoin?.market_data.total_value_locked?.usd
          ? new PricePretty(
              DEFAULT_VS_CURRENCY,
              new Dec(coingeckoCoin?.market_data.total_value_locked.usd)
            )
          : undefined,
        fullyDilutedValuation: coingeckoCoin?.market_data
          .fully_diluted_valuation?.usd
          ? new PricePretty(
              DEFAULT_VS_CURRENCY,
              new Dec(coingeckoCoin?.market_data.fully_diluted_valuation.usd)
            )
          : undefined,
        circulatingSupply: coingeckoCoin?.market_data.circulating_supply,
        marketCap: coingeckoCoin?.market_data.market_cap?.usd
          ? new PricePretty(
              DEFAULT_VS_CURRENCY,
              new Dec(coingeckoCoin?.market_data.market_cap.usd)
            )
          : undefined,
        volume24h:
          volume24h !== undefined
            ? new PricePretty(DEFAULT_VS_CURRENCY, new Dec(volume24h))
            : undefined,
      };
    },
  });
}

const assetMarketCache = new LRUCache<string, CacheEntry>(DEFAULT_LRU_OPTIONS);

/** How long token data, which includes prices, counts as fresh. */
const TOKEN_DATA_TTL = 1000 * 60 * 5; // 5 minutes since there's price data

/** How long past its ttl token data still counts as fresh. Right after the ttl the cached
 *  entry is served while it refreshes in the background, which normally takes seconds;
 *  only data older than this is treated as an outage. */
const TOKEN_DATA_REFRESH_GRACE = 1000 * 60 * 2; // 2 minutes

/** Every token data fetch gives up after this long. The data services have no timeout of
 *  their own, and a hanging fetch would hold every request waiting on it. */
const TOKEN_DATA_FETCH_TIMEOUT = 1000 * 4; // 4 seconds

/** After a failed refresh, wait this long before trying again. */
const TOKEN_DATA_REFRESH_RETRY_DELAY = 1000 * 30; // 30 seconds

let tokenDataRefreshFailedAt = 0;

function isTokenDataFresh(fetchedAt: number): boolean {
  return Date.now() - fetchedAt <= TOKEN_DATA_TTL + TOKEN_DATA_REFRESH_GRACE;
}

/** Fields that are prices or derived from prices. They are dropped when the token data is
 *  served stale during a data-services outage: a last-known price can be badly wrong in a
 *  volatile market, so it's shown as unknown instead. */
const PRICE_DERIVED_FIELDS = [
  "price",
  "price1hChange",
  "price24hChange",
  "price7dChange",
  "marketCap",
  "liquidity",
  "liquidity24hChange",
] as const;

/** Cached token data from the data services, keyed by upper-cased denom, with when it was fetched. */
function getCachedTokenData(forceFresh = false) {
  return cachified({
    cache: assetMarketCache,
    // Kept for its maximum age; `getTokenData` decides when to refresh it.
    ttl: DATA_SERVICES_MARKET_MAX_AGE,
    forceFresh,
    // A failed refresh must not write the old entry back: that would renew it and keep
    // it past its maximum age. `getTokenData` falls back to it instead.
    fallbackToCache: false,
    key: "allTokenData",
    getFreshValue: async () => {
      const allTokenData = await queryAllTokenData({
        signal: AbortSignal.timeout(TOKEN_DATA_FETCH_TIMEOUT),
      });

      const tokenInfoMap = new Map<string, MarketActivity>();
      allTokenData.forEach((tokenData) => {
        const activity = makeMarketActivityFromTokenData(tokenData);
        tokenInfoMap.set(tokenData.denom.toUpperCase(), activity);
      });
      return { tokenInfoMap, fetchedAt: Date.now() };
    },
  });
}

type TokenDataEntry = Awaited<ReturnType<typeof getCachedTokenData>>;

/** The cached token data entry if it's within its maximum age, without fetching. */
function readCachedTokenData(): TokenDataEntry | undefined {
  const entry = assetMarketCache.get("allTokenData") as
    CacheEntry<TokenDataEntry> | undefined;
  if (
    !entry ||
    Date.now() - entry.value.fetchedAt > DATA_SERVICES_MARKET_MAX_AGE
  ) {
    return undefined;
  }
  return entry.value;
}

/** Fetches token data fresh into the cache, recording a failure for the retry delay. */
function refreshTokenData() {
  return getCachedTokenData(true).catch((e) => {
    tokenDataRefreshFailedAt = Date.now();
    throw e;
  });
}

/** Token data, refreshed once it's past its ttl:
 *  - within the refresh grace, the cached entry is returned and refreshed in the background;
 *  - past it (e.g. on an instance that sat idle), the request waits for the refresh, so
 *    prices aren't dropped while the data services are healthy.
 *  A failed refresh falls back to the cached entry, which is then treated as stale once past
 *  the grace, and no refresh is tried again for `TOKEN_DATA_REFRESH_RETRY_DELAY`. */
async function getTokenData() {
  // Within the retry delay after a failed fetch, don't call the data services at all,
  // including for a cold or expired cache.
  if (Date.now() - tokenDataRefreshFailedAt < TOKEN_DATA_REFRESH_RETRY_DELAY) {
    const cached = readCachedTokenData();
    if (cached) return cached;
    throw new Error("Token data is unavailable");
  }

  const tokenData = await getCachedTokenData().catch((e) => {
    tokenDataRefreshFailedAt = Date.now();
    throw e;
  });
  if (Date.now() - tokenData.fetchedAt <= TOKEN_DATA_TTL) return tokenData;

  if (isTokenDataFresh(tokenData.fetchedAt)) {
    refreshTokenData().catch(() => undefined);
    return tokenData;
  }
  return refreshTokenData().catch(() => tokenData);
}

/** False while a data-services outage leaves no fresh token data: prices, liquidity and
 *  market caps are then unknown for every asset, not missing for some. */
export async function isMarketDataAvailable(): Promise<boolean> {
  return getTokenData().then(
    ({ fetchedAt }) => isTokenDataFresh(fetchedAt),
    () => false
  );
}

/** Fetches general asset info such as price and price change, liquidity, volume, and name
 *  configured outside of our asset list (from data services).
 *  Returns `undefined` for a given coin denom if there was an error or it's not available.
 *  While a data-services outage keeps the data past its ttl and refresh grace, price-derived
 *  fields are undefined. */
export async function getAssetMarketActivity({
  coinMinimalDenom,
}: {
  coinMinimalDenom: string;
}): Promise<AssetMarketActivity | undefined> {
  return (await getAssetMarketActivityWithFreshness({ coinMinimalDenom }))
    .activity;
}

/** Market activity whose price-derived fields may be missing (stale data). */
type AssetMarketActivity = Omit<
  MarketActivity,
  (typeof PRICE_DERIVED_FIELDS)[number]
> &
  Partial<Pick<MarketActivity, (typeof PRICE_DERIVED_FIELDS)[number]>>;

/** `getAssetMarketActivity`, plus how much longer its prices stay fresh. */
async function getAssetMarketActivityWithFreshness({
  coinMinimalDenom,
}: {
  coinMinimalDenom: string;
}): Promise<{
  activity: AssetMarketActivity | undefined;
  freshForMs: number;
}> {
  const { tokenInfoMap, fetchedAt } = await getTokenData();
  const freshForMs = Math.max(
    0,
    fetchedAt + TOKEN_DATA_TTL + TOKEN_DATA_REFRESH_GRACE - Date.now()
  );

  const activity = tokenInfoMap.get(coinMinimalDenom.toUpperCase());
  if (!activity || freshForMs > 0) return { activity, freshForMs };

  const staleActivity: Partial<MarketActivity> = { ...activity };
  PRICE_DERIVED_FIELDS.forEach((field) => delete staleActivity[field]);
  return { activity: staleActivity as AssetMarketActivity, freshForMs };
}

type MarketActivity = ReturnType<typeof makeMarketActivityFromTokenData>;
/** Converts raw token data to useful types where applicable. */
function makeMarketActivityFromTokenData(tokenData: TokenData) {
  return {
    price:
      tokenData.price !== null
        ? new PricePretty(DEFAULT_VS_CURRENCY, tokenData.price)
        : undefined,
    denom: tokenData.denom,
    symbol: tokenData.symbol,
    liquidity: new PricePretty(DEFAULT_VS_CURRENCY, tokenData.liquidity ?? 0),
    liquidity24hChange:
      tokenData.liquidity_24h_change !== null
        ? new RatePretty(
            new Dec(tokenData.liquidity_24h_change).quo(new Dec(100))
          )
        : undefined,
    marketCap: tokenData.coingecko_mcap
      ? new PricePretty(DEFAULT_VS_CURRENCY, tokenData.coingecko_mcap)
      : undefined,
    volume24h: new PricePretty(DEFAULT_VS_CURRENCY, tokenData.volume_24h ?? 0),
    volume24hChange:
      tokenData.volume_24h_change !== null
        ? new RatePretty(new Dec(tokenData.volume_24h_change).quo(new Dec(100)))
        : undefined,
    name: tokenData.name,
    price1hChange:
      tokenData.price_1h_change !== null
        ? new RatePretty(new Dec(tokenData.price_1h_change).quo(new Dec(100)))
        : undefined,
    price24hChange:
      tokenData.price_24h_change !== null
        ? new RatePretty(new Dec(tokenData.price_24h_change).quo(new Dec(100)))
        : undefined,
    price7dChange:
      tokenData.price_7d_change !== null
        ? new RatePretty(new Dec(tokenData.price_7d_change).quo(new Dec(100)))
        : undefined,
    exponent: tokenData.exponent,
    display: tokenData.display,
  };
}

/** Set of active CoinGecko IDs that CoinGecko has data for (is "active"). */
export async function getActiveCoingeckoCoins() {
  return await cachified({
    cache: assetMarketCache,
    ttl: 1000 * 60 * 60, // 1 hour
    key: "coinGeckoIds",
    getFreshValue: () =>
      queryCoingeckoCoinIds().then(
        (coins) => new Set(coins.map(({ id }) => id))
      ),
  });
}
