import {
  AccountSetBase,
  AccountStore,
  CosmosAccount,
  CosmosQueries,
  CosmwasmAccount,
  CosmwasmQueries,
  IQueriesStore,
} from "@keplr-wallet/stores";
import { CoinPretty } from "@keplr-wallet/unit";
import { OsmosisAccount, OsmosisQueries } from "@osmosis-labs/stores";
import { computed, makeObservable, observable, runInAction } from "mobx";

export type CallToAction = {
  label: string;
  onClick: () => void;
};
export class NavBarStore {
  @observable
  protected _title: string | undefined;

  @observable
  protected _callToActionButtons: CallToAction[] = [];

  constructor(
    protected readonly chainId: string,
    protected readonly accountStore: AccountStore<
      [CosmosAccount, CosmwasmAccount, OsmosisAccount],
      AccountSetBase & CosmosAccount & CosmwasmAccount & OsmosisAccount
    >,
    protected readonly queriesStore: IQueriesStore<
      CosmosQueries & CosmwasmQueries & OsmosisQueries
    >
  ) {
    makeObservable(this);
  }

  get title() {
    return this._title;
  }

  get callToActionButtons() {
    return this._callToActionButtons;
  }

  set title(val: string | undefined) {
    runInAction(() => (this._title = val));
  }

  /** Use `useEffect` hook to apply currrent page's CTAs. */
  set callToActionButtons(buttons: CallToAction[]) {
    runInAction(() => (this._callToActionButtons = buttons));
  }

  @computed
  get walletInfo(): {
    name: string;
    logoUrl: string;
    balance: CoinPretty;
  } {
    const { bech32Address, name } = this.accountStore.getAccount(this.chainId);
    const balance = this.queriesStore
      .get(this.chainId)
      .queryBalances.getQueryBech32Address(bech32Address)
      .stakable.balance.trim(true)
      .maxDecimals(2)
      .shrink(true)
      .upperCase(true);

    return {
      name,
      logoUrl: "/images/keplr-logo.svg", // TODO: add to future wallet abstraction to use leap wallet
      balance,
    };
  }
}
