import { KVStore } from "@keplr-wallet/common";
import { ChainGetter, HasMapStore, QueryResponse } from "@keplr-wallet/stores";
import { CoinPretty, Dec, PricePretty, RatePretty } from "@keplr-wallet/unit";
import { computed, makeObservable } from "mobx";
import { computedFn } from "mobx-utils";

import { IMPERATOR_INDEXER_DEFAULT_BASEURL } from "..";
import { ObservableQueryExternalBase } from "../base";
import { PositionPerformance } from "./types";

/** Queries performance metrics for a given position. */
export class ObservableQueryPositionPerformanceMetrics extends ObservableQueryExternalBase<PositionPerformance> {
  constructor(
    kvStore: KVStore,
    baseURL: string,
    protected readonly chainGetter: ChainGetter,
    protected readonly chainId: string,
    protected readonly positionId: string
  ) {
    super(kvStore, baseURL, `/cl/v1/position/id/${positionId}`);

    makeObservable(this);
  }

  protected get chain() {
    return this.chainGetter.getChain(this.chainId);
  }

  @computed
  get feesEarned(): CoinPretty[] {
    if (!this.response?.data.total_spread_rewards) return [];
    return this.response.data.total_spread_rewards.map(({ denom, amount }) => {
      const currency = this.chain.forceFindCurrency(denom);
      return new CoinPretty(currency, amount);
    });
  }

  @computed
  get incentivesEarned(): CoinPretty[] {
    if (!this.response?.data.total_incentives_rewards) return [];
    return this.response.data.total_incentives_rewards.map(
      ({ denom, amount }) => {
        const currency = this.chain.forceFindCurrency(denom);
        return new CoinPretty(currency, amount);
      }
    );
  }

  @computed
  get totalEarned(): CoinPretty[] {
    return [...(this.feesEarned ?? []), ...(this.incentivesEarned ?? [])];
  }

  @computed
  get principal(): { coin: CoinPretty; value: PricePretty }[] {
    if (!this.response?.data.principal.assets) return [];
    return this.response.data.principal.assets.map(
      ({ denom, amount, value }) => {
        const currency = this.chain.forceFindCurrency(denom);
        // TODO: If we add add fiat user setting, will need to import from price store and possibly convert
        return {
          coin: new CoinPretty(currency, amount),
          value: new PricePretty(
            { currency: "usd", symbol: "$", maxDecimals: 2, locale: "en-US" },
            value
          ),
        };
      }
    );
  }

  readonly calculateReturnOnInvestment = computedFn(
    (currentPositionCoins: CoinPretty[]): RatePretty => {
      // aggregate principal coins by denom
      const principalCoinDenomMap = new Map<string, CoinPretty>();
      this.totalEarned.forEach((coin) => {
        const existingCoin = principalCoinDenomMap.get(
          coin.currency.coinMinimalDenom
        );
        if (existingCoin) {
          principalCoinDenomMap.set(
            coin.currency.coinMinimalDenom,
            existingCoin.add(coin)
          );
        } else {
          principalCoinDenomMap.set(coin.currency.coinMinimalDenom, coin);
        }
      });

      // calculate ROI per given coin denom
      const roiPerCoinDenom = new Map<string, RatePretty>();
      currentPositionCoins.forEach((coin) => {
        const denom = coin.currency.coinMinimalDenom;
        const principalCoin = principalCoinDenomMap.get(denom);
        if (principalCoin) {
          // roi = (finalValue - initialInvestment) / initialInvestment
          const roi = coin
            .toDec()
            .sub(principalCoin.toDec())
            .quo(principalCoin.toDec())
            .mul(new Dec(100));
          roiPerCoinDenom.set(denom, new RatePretty(roi));
        }
      });

      // return the average of all ROI per coin denom
      const roiPerCoinDenomArray = Array.from(roiPerCoinDenom.values());
      return roiPerCoinDenomArray
        .reduce((sum, roi) => sum.add(roi), new RatePretty(0))
        .quo(new Dec(roiPerCoinDenomArray.length));
    }
  );

  protected setResponse(
    response: Readonly<QueryResponse<PositionPerformance>>
  ): void {
    super.setResponse(response);
    // register any unencountered currencies
    this.chain.addUnknownCurrencies(
      ...response.data.principal.assets.map(({ denom }) => denom),
      ...response.data.total_spread_rewards.map(({ denom }) => denom),
      ...response.data.total_incentives_rewards.map(({ denom }) => denom)
    );
  }
}

/** Query position metrics by position identifier. */
export class ObservableQueryPositionsPerformanceMetrics extends HasMapStore<ObservableQueryPositionPerformanceMetrics> {
  constructor(
    kvStore: KVStore,
    chainGetter: ChainGetter,
    chainId: string,
    poolRewardsBaseUrl = IMPERATOR_INDEXER_DEFAULT_BASEURL
  ) {
    super(
      (bech32Address) =>
        new ObservableQueryPositionPerformanceMetrics(
          kvStore,
          poolRewardsBaseUrl,
          chainGetter,
          chainId,
          bech32Address
        )
    );
  }

  get(positionId: string) {
    return super.get(positionId) as ObservableQueryPositionPerformanceMetrics;
  }
}

export * from "./types";
