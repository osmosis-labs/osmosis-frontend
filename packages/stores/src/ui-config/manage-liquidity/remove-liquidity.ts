import { ChainGetter, IQueriesStore } from "@keplr-wallet/stores";
import { CoinPretty, Dec, DecUtils, PricePretty } from "@keplr-wallet/unit";
import { action, computed, makeObservable, observable } from "mobx";
import { computedFn } from "mobx-utils";

import { IPriceStore } from "../../price";
import { ObservableQueryGammPoolShare, PoolGetter } from "../../queries";
import { ManageLiquidityConfigBase } from "./base";
import { NoAvailableSharesError } from "./errors";

/** Use to config user input UI for eventually sending a valid exit pool msg.
 *  Included convenience functions for deriving pool asset amounts vs current input %.
 */
export class ObservableRemoveLiquidityConfig extends ManageLiquidityConfigBase {
  @observable
  protected _percentage: string;

  @observable
  protected _queryPools: PoolGetter;

  constructor(
    chainGetter: ChainGetter,
    initialChainId: string,
    poolId: string,
    sender: string,
    queriesStore: IQueriesStore,
    queryPoolShare: ObservableQueryGammPoolShare,
    queryPools: PoolGetter,
    initialPercentage: string
  ) {
    super(
      chainGetter,
      initialChainId,
      poolId,
      sender,
      queriesStore,
      queryPoolShare
    );

    this._queryPools = queryPools;
    this._percentage = initialPercentage;

    makeObservable(this);
  }

  /** If invalid, returns `NaN`. */
  get percentage(): number {
    return parseFloat(this._percentage);
  }

  @action
  setPercentage(percentage: string) {
    const value = parseFloat(percentage);
    if (value > 0 && value <= 100) {
      this._percentage = percentage;
    }
  }

  /** Sender's unbonded GAMM shares equivalent to specified percentage. */
  @computed
  get poolShareWithPercentage(): CoinPretty {
    return this.poolShare.mul(
      new Dec(this.percentage).quo(DecUtils.getTenExponentNInPrecisionRange(2))
    );
  }

  /** Pool asset amounts equivalent to senders's unbonded gamm share vs percentage. */
  @computed
  get poolShareAssetsWithPercentage(): CoinPretty[] {
    return (
      this._queryPools.getPool(this._poolId)?.poolAssets.map(({ amount }) => {
        const percentRatio = new Dec(this.percentage).quo(new Dec(100));
        return amount
          .mul(
            this._queryPoolShare.getAvailableGammShareRatio(
              this._sender,
              this.poolId
            )
          )
          .mul(percentRatio);
      }) ?? []
    );
  }

  @computed
  get error(): Error | undefined {
    if (this.poolShare.toDec().isZero()) {
      return new NoAvailableSharesError(
        `No available ${this.poolShare.currency.coinDenom} shares`
      );
    }
  }

  /** Calculate value of currently selected pool shares. */
  readonly computePoolShareValueWithPercentage = computedFn(
    (priceStore: IPriceStore) => {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const fiat = priceStore.getFiatCurrency(priceStore.defaultVsCurrency)!;
      return this.poolShareAssetsWithPercentage.reduce(
        (accummulatedValue, asset) => {
          const assetPrice = priceStore.calculatePrice(
            asset,
            priceStore.defaultVsCurrency
          );
          if (assetPrice) return accummulatedValue.add(assetPrice);
          else return accummulatedValue;
        },
        new PricePretty(fiat, 0)
      );
    }
  );
}
