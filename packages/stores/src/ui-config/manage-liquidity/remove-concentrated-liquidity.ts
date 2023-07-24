import { EmptyAmountError } from "@keplr-wallet/hooks";
import { ChainGetter, IQueriesStore } from "@keplr-wallet/stores";
import { CoinPretty, Dec, DecUtils } from "@keplr-wallet/unit";
import { action, computed, makeObservable, observable } from "mobx";

import {
  ObservableQueryLiquidityPositionById,
  OsmosisQueries,
} from "../../queries";

export class ObservableRemoveConcentratedLiquidityConfig {
  @observable
  protected _percentage: number;

  @observable
  chainId: string;

  get percentage(): number {
    return this._percentage;
  }

  /** Gets the user-selected percentage of the position's liquidity. */
  @computed
  get effectiveLiquidity(): Dec | undefined {
    return this.queryPosition.liquidity?.mul(new Dec(this.percentage));
  }

  /** Get's the amount of each token in position given the position's liquidity and the user's
   *  selected percentage of the position to remove. */
  @computed
  get effectiveLiquidityAmounts():
    | {
        base: CoinPretty;
        quote: CoinPretty;
      }
    | undefined {
    const liquidity = this.effectiveLiquidity;
    const base = this.queryPosition.baseAsset;
    const quote = this.queryPosition.quoteAsset;

    if (!liquidity || !base || !quote) return;

    return {
      base: new CoinPretty(
        base.currency,
        base
          .toDec()
          .mul(
            DecUtils.getTenExponentNInPrecisionRange(base.currency.coinDecimals)
          )
          .mul(new Dec(this.percentage))
      ),
      quote: new CoinPretty(
        quote.currency,
        quote
          .toDec()
          .mul(
            DecUtils.getTenExponentNInPrecisionRange(
              quote.currency.coinDecimals
            )
          )
          .mul(new Dec(this.percentage))
      ),
    };
  }

  @computed
  get error(): Error | undefined {
    if (!this._percentage) {
      return new EmptyAmountError("percentage is zero");
    }

    return;
  }

  protected get queryPosition(): ObservableQueryLiquidityPositionById {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return this.queriesStore
      .get(this.chainId)
      .osmosis!.queryLiquidityPositionsById.getForPositionId(this.positionId);
  }

  constructor(
    protected readonly chainGetter: ChainGetter,
    initialChainId: string,
    protected readonly queriesStore: IQueriesStore<OsmosisQueries>,
    protected readonly poolId: string,
    protected readonly positionId: string,
    initialPercentage: number = 1
  ) {
    this.chainId = initialChainId;
    this._percentage = initialPercentage;

    makeObservable(this);
  }

  @action
  setPercentage(percentage: number) {
    this._percentage = percentage;
  }
}
