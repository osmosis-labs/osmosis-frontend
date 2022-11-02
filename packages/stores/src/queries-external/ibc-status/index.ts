import { KVStore } from "@keplr-wallet/common";
import { HasMapStore } from "@keplr-wallet/stores";
import { makeObservable } from "mobx";
import { computedFn } from "mobx-utils";
import { ObservableQueryExternalBase } from "../base";
import { IbcMetrics, IbcStatus } from "./types";

export class ObservableQueryIbcDepositStatus extends ObservableQueryExternalBase<IbcMetrics> {
  constructor(kvStore: KVStore, baseURL: string, counterPartyChainID: string) {
    // If we are depositing, destination is osmosis
    super(
      kvStore,
      baseURL,
      `/ibc/v1/source/${counterPartyChainID}/destinationosmosis?minutes_trigger=-1`
    );
    makeObservable(this);
  }

  readonly getIbcStatus = computedFn(
    (counterPartyChainID: string): IbcStatus => {
      const ibcRaw = this.response?.data.data.find(
        (statusMetric) => statusMetric.channel_id === counterPartyChainID
      );
      if (!ibcRaw) {
        return IbcStatus.Blocked;
      }

      // TODO: figure out what metrics constitute congested or not
      if (ibcRaw.size_queue > 1_000) {
        return IbcStatus.Congested;
      } else {
        return IbcStatus.OK;
      }
    }
  );
}

export class ObservableQueryIbcDepositStatuses extends HasMapStore<ObservableQueryIbcDepositStatus> {
  constructor(
    kvStore: KVStore,
    ibcStatusBaseUrl = "https://api-osmosis-chain.imperator.co"
  ) {
    super(
      (counterPartyChainID) =>
        new ObservableQueryIbcDepositStatus(
          kvStore,
          ibcStatusBaseUrl,
          counterPartyChainID
        )
    );
  }

  get(counterPartyChainID: string) {
    return super.get(counterPartyChainID) as ObservableQueryIbcDepositStatus;
  }
}

export class ObservableQueryIbcWithdrawStatus extends ObservableQueryExternalBase<IbcMetrics> {
  constructor(kvStore: KVStore, baseURL: string, counterPartyChainID: string) {
    // If we are withdrawing, destination is counterPartyChainID
    super(
      kvStore,
      baseURL,
      `/ibc/v1/source/osmosis/destination${counterPartyChainID}?minutes_trigger=-1`
    );
    makeObservable(this);
  }

  readonly getIbcStatus = computedFn(
    (counterPartyChainID: string): IbcStatus => {
      const ibcRaw = this.response?.data.data.find(
        (statusMetric) => statusMetric.channel_id === counterPartyChainID
      );
      if (!ibcRaw) {
        return IbcStatus.Blocked;
      }

      // TODO: figure out what metrics constitute congested or not
      if (ibcRaw.size_queue > 1_000) {
        return IbcStatus.Congested;
      } else {
        return IbcStatus.OK;
      }
    }
  );
}

export class ObservableQueryIbcWithdrawStatuses extends HasMapStore<ObservableQueryIbcWithdrawStatus> {
  constructor(
    kvStore: KVStore,
    ibcStatusBaseUrl = "https://api-osmosis-chain.imperator.co"
  ) {
    super(
      (counterPartyChainID) =>
        new ObservableQueryIbcWithdrawStatus(
          kvStore,
          ibcStatusBaseUrl,
          counterPartyChainID
        )
    );
  }

  get(counterPartyChainID: string) {
    return super.get(counterPartyChainID) as ObservableQueryIbcWithdrawStatus;
  }
}
