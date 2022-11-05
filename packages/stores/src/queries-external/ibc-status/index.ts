import { KVStore } from "@keplr-wallet/common";
import { HasMapStore } from "@keplr-wallet/stores";
import { makeObservable } from "mobx";
import { computedFn } from "mobx-utils";
import { ObservableQueryExternalBase } from "../base";
import { IbcMetrics, IbcStatus } from "./types";

export class ObservableQueryIbcStatuses {
  protected readonly queryIbcDepositStatuses: Readonly<ObservableQueryIbcDepositStatuses>;
  protected readonly queryIbcWithdrawStatuses: Readonly<ObservableQueryIbcWithdrawStatuses>;

  constructor(
    kvStore: KVStore,
    ibcStatusBaseUrl = "https://api-osmosis-chain.imperator.co"
  ) {
    this.queryIbcDepositStatuses = new ObservableQueryIbcDepositStatuses(
      kvStore,
      ibcStatusBaseUrl
    );
    this.queryIbcWithdrawStatuses = new ObservableQueryIbcWithdrawStatuses(
      kvStore,
      ibcStatusBaseUrl
    );
  }

  readonly getIbcStatus = computedFn(
    (
      direction: "deposit" | "withdraw",
      counterpartyChainId: string,
      sourceChannelId: string
    ) => {
      if (direction === "deposit") {
        return this.queryIbcDepositStatuses
          .get(counterpartyChainId)
          .getIbcStatus(sourceChannelId);
      } else if (direction === "withdraw") {
        return this.queryIbcWithdrawStatuses
          .get(counterpartyChainId)
          .getIbcStatus(sourceChannelId);
      }
    }
  );
}

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
    (sourceChannelId: string): IbcStatus | undefined => {
      const ibcRaw = this.response?.data.data.find(
        (statusMetric) => statusMetric.channel_id === sourceChannelId
      );
      if (!ibcRaw) {
        return undefined;
      }

      if (ibcRaw.size_queue >= 1 && ibcRaw.duration_minutes > 5) {
        return IbcStatus.Congested;
      } else if (ibcRaw.size_queue >= 1 && ibcRaw.duration_minutes > 20) {
        return IbcStatus.Blocked;
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
    (sourceChannelId: string): IbcStatus | undefined => {
      const ibcRaw = this.response?.data.data.find(
        (statusMetric) => statusMetric.channel_id === sourceChannelId
      );
      if (!ibcRaw) {
        return undefined;
      }

      if (ibcRaw.size_queue >= 1 && ibcRaw.duration_minutes > 5) {
        return IbcStatus.Congested;
      } else if (ibcRaw.size_queue >= 1 && ibcRaw.duration_minutes > 20) {
        return IbcStatus.Blocked;
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

export * from "./types";
