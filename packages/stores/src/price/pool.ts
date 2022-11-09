import { makeObservable, observable, computed } from "mobx";
import { CoinGeckoPriceStore, ChainGetter } from "@keplr-wallet/stores";
import { FiatCurrency } from "@keplr-wallet/types";
import { CoinPretty, Dec } from "@keplr-wallet/unit";
import { KVStore } from "@keplr-wallet/common";
import { ObservableQueryPools } from "../queries";
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
    protected readonly queryPool: ObservableQueryPools,
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

  getPrice(coinId: string, vsCurrency?: string): number | undefined {
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

        const osmosisChainInfo = this.chainGetter.getChain(this.osmosisChainId);
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

  getPricePretty(coin: CoinPretty, vsCurrency?: string, decimals = 2): string {
    const coinId = coin.currency.coinGeckoId;
    const currency = vsCurrency ? vsCurrency : this.defaultVsCurrency;
    const symbol = this.getFiatCurrency(currency)?.symbol;
    let price = "0";

    if (coinId) {
      const raw = super.getPrice(coinId, currency);
      price = raw ? raw.toFixed(decimals) : "0";
    }

    return `${symbol}${price}`;
  }
}
