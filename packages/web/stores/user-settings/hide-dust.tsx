import { action, makeObservable, observable, computed } from "mobx";
import { FunctionComponent } from "react";
import { Switch } from "../../components/control";
import { IUserSetting } from ".";

export type HideDustState = { hideDust: boolean };
export class HideDustUserSetting implements IUserSetting<HideDustState> {
  readonly id = "hide-dust";
  readonly controlComponent: FunctionComponent<HideDustState> = ({
    hideDust,
  }) => (
    <Switch
      isOn={hideDust}
      onToggle={() => this.setState({ hideDust: !hideDust })}
    />
  );

  @observable
  protected _state = {
    hideDust: false,
  };

  constructor(protected readonly fiatSymbol: string) {
    makeObservable(this);
    this._state = { hideDust: false };
  }

  getLabel(t: Function): string {
    return t("settings.titleHideDust", { fiatSymbol: this.fiatSymbol });
  }

  @computed
  get state() {
    return this._state;
  }

  @action
  setState(state: HideDustState) {
    this._state = state;
  }
}
