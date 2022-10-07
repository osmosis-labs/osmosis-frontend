import { makeObservable, observable, computed } from "mobx";
import { FunctionComponent } from "react";
import { computedFn } from "mobx-utils";

export interface IUserSetting<TState = any> {
  readonly id: string;
  readonly state: TState;
  readonly displayLabel: string;
  readonly controlComponent: FunctionComponent<TState>;
  setState(value: TState): void;
}

export class UserSettings {
  @observable
  private _settings: IUserSetting[];

  constructor(settings: IUserSetting[]) {
    this._settings = settings;
    makeObservable(this);
  }

  @computed
  get userSettings(): IUserSetting[] {
    return this._settings;
  }

  getUserSettingById = computedFn((id: string) => {
    return this._settings.find(({ id: settingId }) => settingId === id);
  });
}

export * from "./show-dust";
export * from "./language";
