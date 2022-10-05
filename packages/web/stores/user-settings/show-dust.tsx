import { action, makeObservable, observable, computed } from "mobx";
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

  constructor(fiatSymbol: string) {
    this.displayLabel = `Show pools/assets < ${fiatSymbol} 0.01`;
    makeObservable(this);
  }

  @computed
  get state() {
    return this._state;
  }

  @action
  setState(state: ShowDustState) {
    this._state = state;
  }
}
