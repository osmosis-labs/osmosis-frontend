import {
  makeObservable,
  observable,
  computed,
  autorun,
  toJS,
  runInAction,
} from "mobx";
import { FunctionComponent } from "react";
import { computedFn } from "mobx-utils";
import { KVStore } from "@keplr-wallet/common";
import { HideDustUserSetting } from "./hide-dust";
import { LanguageUserSetting } from "./language";

type UserSettingName = HideDustUserSetting["id"] | LanguageUserSetting["id"];

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

export * from "./hide-dust";
export * from "./language";
