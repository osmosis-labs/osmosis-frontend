import {
  CosmosQueries,
  CosmwasmQueries,
  IQueriesStore,
} from "@osmosis-labs/keplr-stores";
import { AccountStore, OsmosisQueries } from "@osmosis-labs/stores";
import { makeObservable, observable, runInAction } from "mobx";
import { ReactNode } from "react";

export type CallToAction = {
  label: string;
  onClick: () => void;
  className?: string;
};
export class NavBarStore {
  @observable
  protected _title: ReactNode | undefined;

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

  set title(val: ReactNode | undefined) {
    runInAction(() => (this._title = val));
  }

  /** Use `useEffect` hook to apply currrent page's CTAs. */
  set callToActionButtons(buttons: CallToAction[]) {
    runInAction(() => (this._callToActionButtons = buttons));
  }
}
