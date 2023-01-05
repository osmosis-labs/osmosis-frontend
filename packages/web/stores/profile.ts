import { KVStore } from "@keplr-wallet/common";
import {
  autorun,
  computed,
  makeObservable,
  observable,
  runInAction,
  toJS,
} from "mobx";

type Avatar = "wosmongton" | "ammelia";

export class ProfileStore {
  @observable
  private _currentAvatar: Avatar;

  constructor(protected readonly kvStore: KVStore) {
    this._currentAvatar = "wosmongton";
    makeObservable(this);

    const storageKey = "profile_store_current_avatar";

    this.kvStore.get(storageKey).then((value: unknown) => {
      runInAction(() => {
        if (!value) return;
        this._currentAvatar = value as Avatar;
      });
    });

    autorun(() => {
      this.kvStore.set(storageKey, toJS(this._currentAvatar));
    });
  }

  @computed
  get currentAvatar(): Avatar {
    return this._currentAvatar;
  }

  setCurrentAvatar(value: Avatar) {
    this._currentAvatar = value;
  }
}
