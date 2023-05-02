import { KVStore } from "@keplr-wallet/common";
import { ChainGetter, CoinGeckoPriceStore } from "@keplr-wallet/stores";
import { FiatCurrency } from "@keplr-wallet/types";
import { Dec } from "@keplr-wallet/unit";
import { computed, makeObservable, observable } from "mobx";
import { computedFn } from "mobx-utils";

import { ObservableQueryPoolGetter } from "../queries";
import { IntermediateRoute, IPriceStore } from "./types";

/**
 * PoolFallbackPriceStore permits the some currencies that are not listed on CoinGecko
 * to use the spot price of the pool as the intermediate.
 */
export class PoolFallbackPriceStore
  extends CoinGeckoPriceStore
  implements IPriceStore
{
  @observable.shallow
  protected _intermidiateRoutes: IntermediateRoute[] = [];

  constructor(
    protected readonly osmosisChainId: string,
    protected readonly chainGetter: ChainGetter,
    kvStore: KVStore,
    supportedVsCurrencies: {
      [vsCurrency: string]: FiatCurrency;
    },
    defaultVsCurrency: string,
    protected readonly queryPool: ObservableQueryPoolGetter,
    intermidiateRoutes: IntermediateRoute[]
  ) {
    super(kvStore, supportedVsCurrencies, defaultVsCurrency, {
      baseURL: "https://prices.osmosis.zone/api/v3",
    });

    this._intermidiateRoutes = intermidiateRoutes;

    makeObservable(this);
  }

  @computed
  get intermediateRoutesMap(): Map<string, IntermediateRoute> {
    const result: Map<string, IntermediateRoute> = new Map();

    for (const route of this._intermidiateRoutes) {
      result.set(route.alternativeCoinId, route);
    }

    return result;
  }

  /**
   * This function calculates the price of a specified coin in a specified vsCurrency or the default currency,
   * by considering Osmosis chain pool information and intermediate routes. If the pool price route is not found,
   * it falls back to the base class getPrice method which simply queries the coinID from a price API.
   *
   * This version is dependent on a `ObservableQueryPoolGetter` to get the pool information, so it's performance is dependent on the ability to fetch queryable pools.
   *
   * @param coinId - The coin ID to calculate the price for.
   * @param vsCurrency - The currency to display the price in. If not provided, the default currency will be used.
   * @returns The calculated price of the coin in the specified vsCurrency or default currency. If calculation fails, returns undefined.
   * @throws Will throw an error if the price calculation fails.
   */
  readonly getPrice = computedFn(
    (coinId: string, vsCurrency?: string): number | undefined => {
      if (!vsCurrency) {
        vsCurrency = this.defaultVsCurrency;
      }

      try {
        const routes = this.intermediateRoutesMap;
        const route = routes.get(coinId);
        if (route) {
          const pool = this.queryPool.getPool(route.poolId);
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
              (cur) => cur.coinMinimalDenom === route.spotPriceSourceDenom
            ) ||
            !osmosisChainInfo.currencies.find(
              (cur) => cur.coinMinimalDenom === route.spotPriceDestDenom
            )
          ) {
            return;
          }

          const inSpotPrice = pool.getSpotPriceInOverOutWithoutSwapFee(
            route.spotPriceSourceDenom,
            route.spotPriceDestDenom
          );
          const spotPriceDec = inSpotPrice.toDec().equals(new Dec(0))
            ? new Dec(0)
            : new Dec(1).quo(inSpotPrice.toDec());
          const destCoinPrice = this.getPrice(route.destCoinId, vsCurrency);
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

        return super.getPrice(coinId, vsCurrency);
      } catch (e: any) {
        console.error(
          `Failed to calculate price of (${coinId}, ${vsCurrency}): ${e?.message}`
        );
        return undefined;
      }
    }
  );
}
