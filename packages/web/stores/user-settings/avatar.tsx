import { action, makeObservable, observable, computed } from "mobx";
import { UserSetting } from ".";

type Avatar = "wosmongton" | "ammelia";

export type AvatarState = { avatar: Avatar };
export class AvatarUserSetting implements UserSetting<AvatarState> {
  readonly id = "avatar";
  readonly controlComponent = () => <></>;

  @observable
  protected _state: AvatarState = {
    avatar: "wosmongton",
  };

  constructor() {
    makeObservable(this);
    this._state = { avatar: "wosmongton" };
  }

  getLabel() {
    return "";
  }

  @computed
  get state() {
    return this._state;
  }

  @action
  setState(state: AvatarState) {
    this._state = state;
  }
}
