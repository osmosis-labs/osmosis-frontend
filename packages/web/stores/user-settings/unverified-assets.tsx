import { action, computed, makeObservable, observable } from "mobx";
import { FunctionComponent } from "react";
import { useTranslation } from "react-multi-lang";

import { Icon } from "../../components/assets";
import { Switch } from "../../components/control";
import { UserSetting } from ".";

export type UnverifiedAssetsState = { showUnverifiedAssets: boolean };
export class UnverifiedAssetsUserSetting
  implements UserSetting<UnverifiedAssetsState>
{
  readonly id = "unverified-assets";
  readonly controlComponent: FunctionComponent<UnverifiedAssetsState> = ({
    showUnverifiedAssets,
  }) => {
    const t = useTranslation();
    return (
      <div className="mt-4 flex flex-col gap-[46px] rounded-2xl border-2 border-osmoverse-700 bg-osmoverse-800 p-6">
        <div className="flex items-center justify-between">
          <Icon id="alert-triangle" className="text-osmoverse-200" />
          <Switch
            isOn={showUnverifiedAssets}
            onToggle={() =>
              this.setState({ showUnverifiedAssets: !showUnverifiedAssets })
            }
          />
        </div>

        <div className="group flex justify-between text-white-full">
          <div className="flex flex-col gap-1">
            <span className="subtitle1 text-left tracking-wide">
              {t("settings.titleUnverifiedAssets")}
            </span>
            <span className="caption tracking-wider text-osmoverse-200">
              {this.getLabel(t)}
            </span>
          </div>
        </div>
      </div>
    );
  };

  @observable
  protected _state = {
    showUnverifiedAssets: false,
  };

  constructor() {
    makeObservable(this);
    this._state = { showUnverifiedAssets: false };
  }

  getLabel(t: Function): string {
    return t("settings.unverifiedAssets");
  }

  @computed
  get state() {
    return this._state;
  }

  @action
  setState(state: UnverifiedAssetsState) {
    this._state = state;
  }
}
