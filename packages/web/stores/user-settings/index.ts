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

export interface IUserSetting<TState = any> {
  readonly id: string;
  readonly state: TState;
  readonly getLabel: (t: Function) => string;
  readonly controlComponent: FunctionComponent<TState>;
  setState(value: TState): void;
}

export class UserSettings {
  @observable
  private _settings: IUserSetting[];

  constructor(protected readonly kvStore: KVStore, settings: IUserSetting[]) {
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
  get userSettings(): IUserSetting[] {
    return this._settings;
  }

  getUserSettingById = computedFn((id: string) => {
    return this._settings.find(({ id: settingId }) => settingId === id);
  });
}

export * from "./show-dust";
export * from "./language";
