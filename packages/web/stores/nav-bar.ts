import {
  CosmosQueries,
  CosmwasmQueries,
  IQueriesStore,
} from "@keplr-wallet/stores";
import { CoinPretty } from "@keplr-wallet/unit";
import { AccountStore, OsmosisQueries } from "@osmosis-labs/stores";
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
    protected readonly accountStore: Pick<AccountStore, "getWallet">,
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
    const wallet = this.accountStore.getWallet(this.chainId);

    const balance = this.queriesStore
      .get(this.chainId)
      .queryBalances.getQueryBech32Address(wallet?.address ?? "")
      .stakable.balance.trim(true)
      .maxDecimals(2)
      .shrink(true)
      .upperCase(true);

    return {
      name: wallet?.walletName ?? "",
      logoUrl: wallet?.walletInfo.logo ?? "/", // TODO: Get from wallet registry
      balance,
    };
  }
}
