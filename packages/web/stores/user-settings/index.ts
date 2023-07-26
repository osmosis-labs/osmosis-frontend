import {
  autorun,
  computed,
  makeObservable,
  observable,
  runInAction,
  toJS,
} from "mobx";
import { FunctionComponent } from "react";

import { HideDustUserSetting } from "~/stores/user-settings/hide-dust";
import { LanguageUserSetting } from "~/stores/user-settings/language";
import { UnverifiedAssetsUserSetting } from "~/stores/user-settings/unverified-assets";

type UserSettingName =
  | HideDustUserSetting["id"]
  | LanguageUserSetting["id"]
  | UnverifiedAssetsUserSetting["id"];

export interface UserSetting<TState = any> {
  readonly id: string;
  readonly state: TState;
  readonly getLabel: (t: Function) => string;
  readonly controlComponent: FunctionComponent<TState>;
  setState(value: TState): void;
}

export class UserSettings {
  @observable
  private _settings: UserSetting[];

  constructor(protected readonly kvStore: KVStore, settings: UserSetting[]) {
    this._settings = settings;
    makeObservable(this);

    // Need to get settings from storage
    this._settings.forEach((setting) => {
      const id = setting.id;
      this.kvStore.get(id).then((value: unknown) =>
        runInAction(() => {
          if (!value) return;
          setting.setState(value);
        })
      );
    });

    autorun(() => {
      // Executed when one or more settings was updated
      // We need to update the storage
      this._settings.forEach((setting) => {
        const id = setting.id;
        const state = toJS(setting.state);
        this.kvStore.set(id, state);
      });
    });
  }

  @computed
  get userSettings(): UserSetting[] {
    return this._settings;
  }

  readonly getUserSettingById = computedFn(
    <T>(id: UserSettingName): UserSetting<T> | undefined => {
      return this._settings.find(({ id: settingId }) => settingId === id);
    }
  );
}

export * from "~/stores/user-settings/hide-dust";
export * from "~/stores/user-settings/language";
export * from "~/stores/user-settings/unverified-assets";
