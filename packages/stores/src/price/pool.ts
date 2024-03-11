import { KVStore } from "@keplr-wallet/common";
import { FiatCurrency } from "@keplr-wallet/types";
import { CoinPretty, Dec, PricePretty } from "@keplr-wallet/unit";
import { ChainGetter, CoinGeckoPriceStore } from "@osmosis-labs/keplr-stores";
import { Asset } from "@osmosis-labs/types";
import { computedFn } from "mobx-utils";

import { ObservableQueryPoolGetter } from "../queries-external/pools";
import { IPriceStore } from "./types";

/**
 * PoolFallbackPriceStore permits the some currencies that are not listed on CoinGecko
 * to use the spot price of the pool as the intermediate.
 */
export class PoolFallbackPriceStore
  extends CoinGeckoPriceStore
  implements IPriceStore
{
  /** IBC Hash => `Asset` */
  protected _assetsMap: Map<string, Asset>;
  protected _assetsByCoingeckoId: Map<string, Asset>;

  constructor(
    protected readonly osmosisChainId: string,
    protected readonly chainGetter: ChainGetter,
    kvStore: KVStore,
    supportedVsCurrencies: {
      [vsCurrency: string]: FiatCurrency;
    },
    defaultVsCurrency: string,
    protected readonly queryPools: ObservableQueryPoolGetter,
    assets: Asset[]
  ) {
    super(kvStore, supportedVsCurrencies, defaultVsCurrency, {
      baseURL: "https://prices.osmosis.zone/api/v3",
    });

    const result: Map<string, Asset> = new Map();
    const resultByCoingeckoId: Map<string, Asset> = new Map();

    for (const asset of assets) {
      result.set(asset.coinMinimalDenom, asset);
      if (asset.coingeckoId) {
        resultByCoingeckoId.set(asset.coingeckoId, asset);
      }
    }

    this._assetsMap = result;
    this._assetsByCoingeckoId = resultByCoingeckoId;
  }

  readonly getPrice = computedFn(
    (coinMinimalDenom: string, vsCurrency?: string): number | undefined => {
      if (!vsCurrency) {
        vsCurrency = this.defaultVsCurrency;
      }

      if (!this.queryPools.response) {
        this.queryPools.getAllPools();
        return;
      }

      try {
        const asset =
          this._assetsMap.get(coinMinimalDenom) ??
          this._assetsByCoingeckoId.get(coinMinimalDenom);

        if (!asset) throw new Error(`Asset not found: ${coinMinimalDenom}`);
        if (!asset.price && !asset.coingeckoId) {
          console.warn(
            `Asset ${coinMinimalDenom} has no price info or coingecko_id`
          );
          return undefined;
        }

        if (asset.price) {
          const route = {
            poolId: asset.price.poolId,
            destCoinBase: asset.price.denom,
            sourceCoinBase: asset.coinMinimalDenom,
          };
          const pool = this.queryPools.getPool(route.poolId);
          if (!pool) {
            return;
          }

          const osmosisChainInfo = this.chainGetter.getChain(
            this.osmosisChainId
          );
          // If the currencies are unknown yet,
          // it is assumed that the raw currency with the 0 decimals.
          // But, using this raw currency will make improper result because it will create greater spot price than expected.
          // So, if the currencies are unknown, block calculating the price.
          if (
            !osmosisChainInfo.currencies.find(
              (cur) => cur.coinMinimalDenom === route.destCoinBase
            ) ||
            !osmosisChainInfo.currencies.find(
              (cur) => cur.coinMinimalDenom === route.sourceCoinBase
            )
          ) {
            return;
          }

          const inSpotPrice = pool.getSpotPriceInOverOutWithoutSwapFee(
            route.sourceCoinBase,
            route.destCoinBase
          );
          const spotPriceDec = inSpotPrice.toDec().equals(new Dec(0))
            ? new Dec(0)
            : new Dec(1).quo(inSpotPrice.toDec());
          const destCoinPrice = this.getPrice(route.destCoinBase, vsCurrency);
          if (destCoinPrice === undefined) {
            return;
          }

          const res = parseFloat(spotPriceDec.toString()) * destCoinPrice;
          if (Number.isNaN(res)) {
            return;
          }
          // CoinGeckoPriceStore uses the `Dec` to calculate the price of assets.
          // However, `Dec` requires that the decimals must not exceed 18.
          // Since the spot price is `Dec`, it can have 18 decimals,
          // and if the `destCoinPrice` has the fraction, the multiplication can make the more than 18 decimals.
          // To prevent this problem, shorthand the fraction part.
          return parseFloat(res.toFixed(10));
        }

        if (!asset.coingeckoId)
          throw new Error(`Asset ${coinMinimalDenom} has no coingeckoId`);

        return super.getPrice(asset.coingeckoId, vsCurrency);
      } catch (e: any) {
        console.error(
          `Failed to calculate price of (${coinMinimalDenom}, ${vsCurrency}): ${e?.message}`
        );
        return undefined;
      }
    }
  );

  /** Calculate price of coin, including pool share coins. */
  readonly calculatePrice = (
    coin: CoinPretty,
    vsCurrency?: string
  ): PricePretty | undefined => {
    // handle if coin is pool share
    if (coin.currency.coinMinimalDenom.startsWith("gamm/pool/")) {
      const poolId = coin.currency.coinMinimalDenom.replace("gamm/pool/", "");
      const pool = this.queryPools.getPool(poolId);
      const poolTvl = pool?.computeTotalValueLocked(this);
      const fiat = this.getFiatCurrency(vsCurrency ?? this.defaultVsCurrency);
      if (!poolTvl || !pool || !fiat) return;

      // coin's ratio against all shares in pool, multiplied by pool's TVL
      return new PricePretty(fiat, poolTvl.mul(coin.quo(pool.totalShare)));
    }

    return super.calculatePrice(coin, vsCurrency);
  };

  /** Calculate price of more than one coin. */
  readonly calculateTotalPrice = (
    coins: CoinPretty[],
    vsCurrency?: string
  ): PricePretty | undefined => {
    const fiat = this.getFiatCurrency(vsCurrency ?? this.defaultVsCurrency);
    if (!fiat) return;

    return coins.reduce((sum, coin) => {
      const coinPrice = this.calculatePrice(coin, vsCurrency);
      if (coinPrice) return sum.add(coinPrice);
      return sum;
    }, new PricePretty(fiat, 0));
  };
}
