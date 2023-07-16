import { KVStore } from "@keplr-wallet/common";
import { ChainGetter, HasMapStore } from "@keplr-wallet/stores";
import { CoinPretty, PricePretty, RatePretty } from "@keplr-wallet/unit";
import { computed, makeObservable } from "mobx";
import { computedFn } from "mobx-utils";

import { IPriceStore } from "../../price";
import { IMPERATOR_INDEXER_DEFAULT_BASEURL } from "..";
import { ObservableQueryExternalBase } from "../base";
import { PositionPerformance } from "./types";

/** Queries performance metrics for a given position. */
export class ObservableQueryPositionPerformanceMetrics extends ObservableQueryExternalBase<PositionPerformance> {
  // TODO: If we add add fiat user setting, will need to import from price store and possibly convert
  /** API returns hardcoded USD values. */
  readonly fiatCurrency = {
    currency: "usd",
    symbol: "$",
    maxDecimals: 2,
    locale: "en-US",
  };

  constructor(
    kvStore: KVStore,
    baseURL: string,
    protected readonly chainGetter: ChainGetter,
    protected readonly chainId: string,
    protected readonly priceStore: IPriceStore,
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
    if (!this.response) return [];
    return (
      this.response.data?.total_spread_rewards?.map(({ denom, amount }) => {
        const currency = this.chain.forceFindCurrency(denom);
        return new CoinPretty(currency, amount);
      }) ?? []
    );
  }

  @computed
  get incentivesEarned(): CoinPretty[] {
    if (!this.response) return [];
    return (
      this.response.data?.total_incentives_rewards?.map(({ denom, amount }) => {
        const currency = this.chain.forceFindCurrency(denom);
        return new CoinPretty(currency, amount);
      }) ?? []
    );
  }

  @computed
  get totalEarnedValue(): PricePretty {
    return this.totalEarned.reduce((sum, coin) => {
      const price = this.priceStore.calculatePrice(coin);
      if (price) return sum.add(price);
      else return sum;
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    }, new PricePretty(this.priceStore.getFiatCurrency(this.priceStore.defaultVsCurrency)!, 0));
  }

  @computed
  get totalEarned(): CoinPretty[] {
    // aggregate earned coins by denom
    const earnedCoinDenomMap = new Map<string, CoinPretty>();
    [...(this.incentivesEarned ?? []), ...(this.feesEarned ?? [])].forEach(
      (coin) => {
        const existingCoin = earnedCoinDenomMap.get(
          coin.currency.coinMinimalDenom
        );
        if (existingCoin) {
          earnedCoinDenomMap.set(
            coin.currency.coinMinimalDenom,
            existingCoin.add(coin)
          );
        } else {
          earnedCoinDenomMap.set(coin.currency.coinMinimalDenom, coin);
        }
      }
    );
    return Array.from(earnedCoinDenomMap.values());
  }

  @computed
  get principal(): { coin: CoinPretty; value: PricePretty }[] {
    if (!this.response) return [];
    return (
      this.response.data?.principal?.assets?.map(({ denom, amount, value }) => {
        const currency = this.chain.forceFindCurrency(denom);
        return {
          coin: new CoinPretty(currency, amount),
          value: new PricePretty(this.fiatCurrency, value),
        };
      }) ?? []
    );
  }

  @computed
  get totalPrincipalValue(): PricePretty {
    if (!this.response) return new PricePretty(this.fiatCurrency, 0);
    return new PricePretty(
      this.fiatCurrency,
      this.response.data?.principal?.value ?? 0
    );
  }

  readonly calculateReturnOnInvestment = computedFn(
    (currentPositionCoins: CoinPretty[]): RatePretty => {
      if (!this.response) return new RatePretty(0);

      // aggregate principal coins by denom
      const principalCoinDenomMap = new Map<string, CoinPretty>();
      this.principal.forEach(({ coin }) => {
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
        if (principalCoin && !principalCoin.toDec().isZero()) {
          // roi = (finalValue - initialInvestment) / initialInvestment
          const roi = coin
            .toDec()
            .sub(principalCoin.toDec())
            .quo(principalCoin.toDec());
          roiPerCoinDenom.set(denom, new RatePretty(roi));
        }
      });

      // return the average of all ROI per coin denom
      const roiPerCoinDenomArray = Array.from(roiPerCoinDenom.values());
      if (roiPerCoinDenomArray.length === 0) return new RatePretty(0);
      return roiPerCoinDenomArray
        .reduce((sum, roi) => sum.add(roi), new RatePretty(0))
        .quo(new Dec(roiPerCoinDenomArray.length));
    }
  );
}

/** Query position metrics by position identifier. */
export class ObservableQueryPositionsPerformanceMetrics extends HasMapStore<ObservableQueryPositionPerformanceMetrics> {
  constructor(
    kvStore: KVStore,
    chainGetter: ChainGetter,
    chainId: string,
    priceStore: IPriceStore,
    indexerBaseUrl = IMPERATOR_INDEXER_DEFAULT_BASEURL
  ) {
    super(
      (bech32Address) =>
        new ObservableQueryPositionPerformanceMetrics(
          kvStore,
          indexerBaseUrl,
          chainGetter,
          chainId,
          priceStore,
          bech32Address
        )
    );
  }

  get(positionId: string) {
    return super.get(positionId) as ObservableQueryPositionPerformanceMetrics;
  }
}

export * from "./types";
