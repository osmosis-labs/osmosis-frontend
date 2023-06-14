import { EmptyAmountError } from "@keplr-wallet/hooks";
import {
  ChainGetter,
  IQueriesStore,
  ObservableQueryBalances,
} from "@keplr-wallet/stores";
import { ConcentratedLiquidityPool } from "@osmosis-labs/pools";
import { action, computed, makeObservable, observable } from "mobx";

/** Use to config user input UI for eventually sending a valid exit pool msg.
 *  Included convenience functions for deriving pool asset amounts vs current input %.
 */
export class ObservableRemoveConcentratedLiquidityConfig {
  @observable
  protected _sender: string;

  @observable
  protected _pool: ConcentratedLiquidityPool;

  @observable
  protected _percentage: number;

  @observable
  protected chainId: string;

  constructor(
    protected readonly chainGetter: ChainGetter,
    initialChainId: string,
    sender: string,
    protected readonly queriesStore: IQueriesStore,
    protected readonly queryBalances: ObservableQueryBalances,
    pool: ConcentratedLiquidityPool,
    initialPercentage: number
  ) {
    this.chainId = initialChainId;
    this._pool = pool;
    this._sender = sender;
    this._percentage = initialPercentage;

    makeObservable(this);
  }

  @action
  setSender(sender: string) {
    this._sender = sender;
  }

  get sender(): string {
    return this._sender;
  }

  get percentage(): number {
    return this._percentage;
  }

  @action
  setPercentage(percentage: number) {
    this._percentage = percentage;
  }

  @computed
  get error(): Error | undefined {
    if (!this._percentage) {
      return new EmptyAmountError("percentage is zero");
    }

    return;
  }
}
