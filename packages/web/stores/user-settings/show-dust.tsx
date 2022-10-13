import {
  action,
  makeObservable,
  observable,
  computed,
  runInAction,
} from "mobx";
import { KVStore } from "@keplr-wallet/common";
import { FunctionComponent } from "react";
import { Switch } from "../../components/control";
import { IUserSetting } from ".";

export type ShowDustState = { showDust: boolean };
export class ShowDustUserSetting implements IUserSetting<ShowDustState> {
  readonly id = "show-dust";
  readonly displayLabel: string;
  readonly controlComponent: FunctionComponent<ShowDustState> = ({
    showDust,
  }) => (
    <Switch
      isOn={showDust}
      onToggle={() => this.setState({ showDust: !showDust })}
    />
  );

  @observable
  protected _state = {
    showDust: false,
  };

  constructor(protected readonly kvStore: KVStore, fiatSymbol: string) {
    this.displayLabel = `Show pools/assets < ${fiatSymbol} 0.01`;
    makeObservable(this);

    this.kvStore
      .get(this.id)
      .then((value) =>
        runInAction(() => (this._state = { showDust: value as boolean }))
      );
  }

  @computed
  get state() {
    return this._state;
  }

  @action
  setState(state: ShowDustState) {
    this._state = state;
    this.kvStore.set(this.id, state.showDust);
  }
}
