import { observable, makeObservable, action } from "mobx";

/** Simple base config dealing with a user's address. */
export class UserConfig {
  @observable
  protected bech32Address: string = "";

  constructor(bech32Address?: string) {
    if (bech32Address) this.bech32Address = bech32Address;

    makeObservable(this);
  }

  @action
  setBech32Address(bech32Address: string) {
    this.bech32Address = bech32Address;
  }
}
