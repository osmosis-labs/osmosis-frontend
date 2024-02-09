import { CoinPretty, Dec, DecUtils } from "@keplr-wallet/unit";
import { EmptyAmountError } from "@osmosis-labs/keplr-hooks";
import { ChainGetter } from "@osmosis-labs/keplr-stores";
import { action, computed, makeObservable, observable } from "mobx";

type Position = {
  liquidity: Dec;
  baseAsset: CoinPretty;
  quoteAsset: CoinPretty;
};
export class ObservableRemoveConcentratedLiquidityConfig {
  @observable
  protected _percentage: number;

  @observable
  chainId: string;

  @observable
  position: Position;

  get percentage(): number {
    return this._percentage;
  }

  /** Gets the user-selected percentage of the position's liquidity. */
  @computed
  get effectiveLiquidity(): Dec | undefined {
    return this.position.liquidity?.mul(new Dec(this.percentage));
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
    const base = this.position.baseAsset;
    const quote = this.position.quoteAsset;

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

  constructor(
    protected readonly chainGetter: ChainGetter,
    initialChainId: string,
    protected readonly poolId: string,
    protected readonly initialPosition: {
      liquidity: Dec;
      baseAsset: CoinPretty;
      quoteAsset: CoinPretty;
    },
    initialPercentage: number = 1
  ) {
    this.chainId = initialChainId;
    this._percentage = initialPercentage;

    this.position = initialPosition;

    makeObservable(this);
  }

  @action
  setPercentage(percentage: number) {
    this._percentage = percentage;
  }

  @action
  setPosition(position: Position) {
    this.position = position;
  }
}
