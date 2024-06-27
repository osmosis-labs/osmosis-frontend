import { action, computed, makeObservable, observable } from "mobx";
import { Fragment, FunctionComponent } from "react";

import { Icon } from "~/components/assets";
import { Switch } from "~/components/ui/switch";
import { useTranslation } from "~/hooks";
import { useWindowSize } from "~/hooks";
import { UserSetting } from "~/stores/user-settings";

export type HideBalancesState = { hideBalances: boolean };
export class HideBalancesUserSetting implements UserSetting<HideBalancesState> {
  readonly id = "hide-balances";
  readonly controlComponent: FunctionComponent<HideBalancesState> = ({
    hideBalances,
  }) => {
    const { t } = useTranslation();

    const { isMobile } = useWindowSize();

    return (
      <Fragment>
        {!isMobile && (
          <div className="mt-4 flex flex-col gap-[46px] rounded-2xl border-2 border-osmoverse-700 bg-osmoverse-800 p-6">
            <div className="flex items-center justify-between">
              <Icon id="zoom-out" className="text-osmoverse-200" />
              <Switch
                checked={hideBalances}
                onCheckedChange={() => {
                  this.setState({ hideBalances: !hideBalances });
                }}
              />
            </div>

            <div className="group flex justify-between text-white-full">
              <div className="flex flex-col gap-1">
                <span className="subtitle1 text-left tracking-wide">
                  {t("settings.hideBalances")}
                </span>
                <span className="caption tracking-wider text-osmoverse-200">
                  {this.getLabel(t)}
                </span>
              </div>
            </div>
          </div>
        )}
      </Fragment>
    );
  };

  @observable
  protected _state = {
    hideBalances: false,
  };

  constructor() {
    makeObservable(this);
    this._state = { hideBalances: false };
  }

  getLabel(t: Function): string {
    return t("settings.titleHideBalances");
  }

  @computed
  get state() {
    return this._state;
  }

  @action
  setState(state: HideBalancesState) {
    this._state = state;
  }
}
