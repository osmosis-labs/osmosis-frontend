import { action, makeObservable, observable } from "mobx";

export class ManageLiquidityConfigBase {
  @observable
  protected _poolId: string;

  @observable
  protected _sender: string;

  constructor(poolId: string, sender: string) {
    this._poolId = poolId;
    this._sender = sender;

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
}
