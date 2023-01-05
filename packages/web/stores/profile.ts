import { KVStore } from "@keplr-wallet/common";
import { computed, makeObservable, observable, runInAction, toJS } from "mobx";

type Avatar = "wosmongton" | "ammelia";

export class ProfileStore {
  @observable
  private _currentAvatar: Avatar;

  private readonly _avatarStorageKey = "profile_store_current_avatar";

  constructor(protected readonly kvStorage: KVStore) {
    this._currentAvatar = "wosmongton";
    makeObservable(this);

    // Need to get previous avatar from storage
    this.kvStorage.get(this._avatarStorageKey).then((value: unknown) => {
      runInAction(() => {
        if (!value) return;
        this._currentAvatar = value as Avatar;
      });
    });
  }

  @computed
  get currentAvatar(): Avatar {
    return this._currentAvatar;
  }

  setCurrentAvatar(value: Avatar) {
    this._currentAvatar = value;
    this.kvStorage.set(this._avatarStorageKey, toJS(this._currentAvatar));
  }
}
