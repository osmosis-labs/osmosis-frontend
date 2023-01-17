import { action, makeObservable, observable, computed } from "mobx";
import { FunctionComponent } from "react";
import { Switch } from "../../components/control";
import { IUserSetting } from ".";
import { Icon } from "../../components/assets";

export type HideDustState = { hideDust: boolean };
export class HideDustUserSetting implements IUserSetting<HideDustState> {
  readonly id = "hide-dust";
  readonly controlComponent: FunctionComponent<HideDustState> = ({
    hideDust,
  }) => (
    <div className="mt-4 flex flex-col gap-[46px] rounded-2xl border-2 border-osmoverse-700 bg-osmoverse-800 p-6">
      <div className="flex items-center justify-between">
        <Icon id="dust-broom" className="text-osmoverse-200" />
        <Switch
          isOn={hideDust}
          onToggle={() => this.setState({ hideDust: !hideDust })}
        />
      </div>

      <div className="group flex justify-between text-white-full">
        <div className="flex flex-col gap-1">
          <span className="subtitle1 text-left tracking-wide">Filter Dust</span>
          <span className="caption tracking-wider text-osmoverse-200">
            {"Hide pools/assets < $0.01"}
          </span>
        </div>
      </div>
    </div>
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
