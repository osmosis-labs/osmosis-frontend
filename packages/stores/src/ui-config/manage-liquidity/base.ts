import { TxChainSetter } from "@keplr-wallet/hooks";
import { ChainGetter, IQueriesStore } from "@keplr-wallet/stores";
import { CoinPretty } from "@keplr-wallet/unit";
import { action, makeObservable, observable } from "mobx";

import { ObservableQueryGammPoolShare } from "../../queries";

export class ManageLiquidityConfigBase extends TxChainSetter {
  @observable
  protected _poolId: string;

  @observable
  protected _sender: string;

  @observable
  protected _queryPoolShare: ObservableQueryGammPoolShare;

  @observable.ref
  protected _queriesStore: IQueriesStore;

  constructor(
    chainGetter: ChainGetter,
    initialChainId: string,
    poolId: string,
    sender: string,
    queriesStore: IQueriesStore,
    queryPoolShare: ObservableQueryGammPoolShare
  ) {
    super(chainGetter, initialChainId);

    this._poolId = poolId;
    this._sender = sender;
    this._queriesStore = queriesStore;
    this._queryPoolShare = queryPoolShare;

    makeObservable(this);
  }

  get poolId(): string {
    return this._poolId;
  }

  @action
  setPoolId(poolId: string) {
    this._poolId = poolId;
  }

  @action
  setSender(sender: string) {
    this._sender = sender;
  }

  get sender(): string {
    return this._sender;
  }

  @action
  setQueryPoolShare(queryPoolShare: ObservableQueryGammPoolShare) {
    this._queryPoolShare = queryPoolShare;
  }

  get poolShare(): CoinPretty {
    return this._queryPoolShare.getAvailableGammShare(
      this._sender,
      this.poolId
    );
  }
}
