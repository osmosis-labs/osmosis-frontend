import { observable, makeObservable, computed } from "mobx";
import {
  AccountStore,
  CosmosAccount,
  CosmwasmAccount,
  AccountSetBase,
  QueriesStore,
  CosmosQueries,
  CosmwasmQueries,
} from "@keplr-wallet/stores";
import { CoinPretty } from "@keplr-wallet/unit";
import { OsmosisAccount, OsmosisQueries } from "@osmosis-labs/stores";

export class NavBarStore {
  @observable
  title: string | undefined;

  @observable
  protected _callToActionButtons: {
    onClick: () => void;
  }[] = [];

  constructor(
    protected readonly chainId: string,
    protected readonly accountStore: AccountStore<
      [CosmosAccount, CosmwasmAccount, OsmosisAccount],
      AccountSetBase & CosmosAccount & CosmwasmAccount & OsmosisAccount
    >,
    protected readonly queriesStore: QueriesStore<
      [CosmosQueries, CosmwasmQueries, OsmosisQueries]
    >
  ) {
    makeObservable(this);
  }

  @computed
  get walletInfo(): {
    bech32Address: string;
    logoUrl: string;
    balance: CoinPretty;
  } {
    const bech32Address = this.accountStore.getAccount(
      this.chainId
    ).bech32Address;
    const balance = this.queriesStore
      .get(this.chainId)
      .queryBalances.getQueryBech32Address(bech32Address)
      .stakable.balance.trim(true)
      .maxDecimals(2)
      .shrink(true)
      .upperCase(true);

    return {
      bech32Address,
      logoUrl: "/images/keplr-logo.svg", // TODO: add to future wallet abstraction to use leap wallet
      balance,
    };
  }
}
