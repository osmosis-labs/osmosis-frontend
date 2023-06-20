import { KVStore } from "@keplr-wallet/common";
import {
  action,
  computed,
  makeObservable,
  observable,
  runInAction,
  toJS,
} from "mobx";

type Avatar = "wosmongton" | "ammelia" | "stargaze-pfp";

export class ProfileStore {
  @observable
  private _currentAvatar: Avatar;
  @observable
  private _stargazeAvatarUri: string | undefined;

  private readonly _avatarStorageKey = "profile_store_current_avatar";
  private readonly _stargazeAvatarUriStorageKey =
    "profile_store_stargaze_avatar_uri";

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
    // Need to get previous stargaze avatar uri from storage
    this.kvStorage
      .get(this._stargazeAvatarUriStorageKey)
      .then((value: unknown) => {
        runInAction(() => {
          if (!value) return;
          this._stargazeAvatarUri = value as string;
        });
      });
  }

  @computed
  get currentAvatar(): Avatar {
    return this._currentAvatar;
  }

  @computed
  get stargazeAvatarUri(): string | undefined {
    return this._stargazeAvatarUri;
  }

  @action
  setCurrentAvatar(value: Avatar) {
    this._currentAvatar = value;
    this.kvStorage.set(this._avatarStorageKey, toJS(this._currentAvatar));
  }

  @action
  setStargazeAvatarUri(value: string | undefined) {
    this._stargazeAvatarUri = value;
    this.kvStorage.set(
      this._stargazeAvatarUriStorageKey,
      toJS(this._stargazeAvatarUri)
    );
  }
}
