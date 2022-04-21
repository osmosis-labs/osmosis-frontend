import { action, computed, makeObservable, observable, override } from "mobx";
import { AmountConfig } from "@keplr-wallet/hooks";
import { AppCurrency } from "@keplr-wallet/types";
import { ChainGetter, IQueriesStore } from "@keplr-wallet/stores";

/** Used for configuring the amount and fee of a token to be sent by a sender. Is observable. */
export class ObservableAmountConfig extends AmountConfig {
  @observable.ref
  protected _currency: AppCurrency;

  constructor(
    chainGetter: ChainGetter,
    queriesStore: IQueriesStore,
    initialChainId: string,
    sender: string,
    currency: AppCurrency
  ) {
    super(chainGetter, queriesStore, initialChainId, sender, undefined);

    this._currency = currency;

    makeObservable(this);
  }

  get currency(): AppCurrency {
    return this._currency;
  }

  @override
  setAmount(amount: string) {
    this.setIsMax(false);
    super.setAmount(amount);
  }

  @action
  setCurrency(currency: AppCurrency) {
    this._currency = currency;
  }

  @override
  get sendCurrency(): AppCurrency {
    return this.currency;
  }

  @computed
  get sendableCurrencies(): AppCurrency[] {
    return [this.sendCurrency];
  }
}
