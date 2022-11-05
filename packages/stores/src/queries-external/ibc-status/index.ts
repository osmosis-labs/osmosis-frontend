import { KVStore } from "@keplr-wallet/common";
import { HasMapStore } from "@keplr-wallet/stores";
import { makeObservable } from "mobx";
import { computedFn } from "mobx-utils";
import { ObservableQueryExternalBase } from "../base";
import { IbcStatus } from "./types";

export class ObservableQueryIbcStatus extends ObservableQueryExternalBase<IbcStatus> {
  constructor(kvStore: KVStore, baseURL: string, _counterPartyChainID: string) {
    super(kvStore, baseURL, `/ibc/v1/all`);
    makeObservable(this);
  }

  readonly getIbcStatus = computedFn((counterPartyChainID: string): string => {
    const ibcRaw = this.response?.data.data.find(
      (statusMetric) => statusMetric.channel_id === counterPartyChainID
    );
    if (!ibcRaw) {
      return "Congested";
    }

    // TODO: figure out what metrics constitute congested or not
    if (ibcRaw.size_queue > 1_000) {
      return "Congested";
    } else {
      return "OK";
    }
  });
}

export class ObservableQueryIbcStatuses extends HasMapStore<ObservableQueryIbcStatus> {
  constructor(
    kvStore: KVStore,
    ibcStatusBaseUrl = "https://api-osmosis-chain.imperator.co"
  ) {
    super(
      (counterPartyChainID) =>
        new ObservableQueryIbcStatus(
          kvStore,
          ibcStatusBaseUrl,
          counterPartyChainID
        )
    );
  }

  get(counterPartyChainID: string) {
    return super.get(counterPartyChainID) as ObservableQueryIbcStatus;
  }
}
