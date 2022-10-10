import { action, makeObservable, observable, computed } from "mobx";
import { FunctionComponent } from "react";
import { Switch } from "../../components/control";
import { IUserSetting } from ".";

export type ShowDustState = { showDust: boolean };

export class ShowDustUserSetting implements IUserSetting<ShowDustState> {
  readonly id = "show-dust";
  readonly fiatSymbol: string;
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
    this.fiatSymbol = fiatSymbol;
    makeObservable(this);
  }

  getLabel(t: Function): string {
    return t("settings.titleShowDust", { fiatSymbol: this.fiatSymbol });
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
