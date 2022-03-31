import { observable, makeObservable, action, computed } from "mobx";
import { CoinPretty, Dec, DecUtils } from "@keplr-wallet/unit";
import { ChainGetter } from "@keplr-wallet/stores";
import { ObservableQueryGammPoolShare } from "../../queries";
import { ManageLiquidityConfigBase } from "./base";

/** Use to config user input UI for eventually sending a valid exit pool msg.
 *  Included convenience functions for deriving pool asset amounts vs current input %.
 */
export class ObservableRemoveLiquidityConfig extends ManageLiquidityConfigBase {
  @observable
  protected _percentage: string;

  constructor(
    chainGetter: ChainGetter,
    initialChainId: string,
    poolId: string,
    sender: string,
    queryPoolShare: ObservableQueryGammPoolShare,
    initialPercentage: string
  ) {
    super(chainGetter, initialChainId, poolId, sender, queryPoolShare);

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
    return this._queryPoolShare
      .getShareAssets(this._sender, this._poolId)
      .map(({ asset }) =>
        asset.mul(new Dec(this.percentage).quo(new Dec(100)))
      );
  }
}
