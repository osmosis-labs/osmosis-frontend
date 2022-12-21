import { computed, makeObservable } from "mobx";
import { HasMapStore } from "@keplr-wallet/stores";
import { ObservableQueryExternalBase } from "../base";
import { KVStore } from "@keplr-wallet/common";
import { computedFn } from "mobx-utils";
import { IbcStatus } from "./types";

/** Queries for ibc chain data*/
class ObservableQueryIbcChainStatus extends ObservableQueryExternalBase<
  [
    {
      source: string;
      destination: string;
      channel_id: string;
      token_symbol: string;
      token_name: string;
      last_tx: string;
      size_queue: number;
      duration_minutes: number;
    }
  ]
> {
  constructor(
    kvStore: KVStore,
    baseURL: string,
    sourceChainId: string,
    destinationChainId: string
  ) {
    super(
      kvStore,
      baseURL,
      `/ibc/v1/source/${sourceChainId}/destination${destinationChainId}?minutes_trigger=-1`
    );

    makeObservable(this);
  }

  readonly getIbcStatus = computedFn(
    (channelId: string): IbcStatus | undefined => {
      const channelData =
        this.response &&
        "data" in this.response &&
        Array.isArray(this.response.data)
          ? this.response.data.find(
              (channel) => channel.channel_id === channelId
            )
          : undefined;
      if (channelData) {
        if (channelData.size_queue > 5) {
          if (channelData.duration_minutes > 20) return "congested";
          else if (channelData.duration_minutes > 60) return "blocked";
        }
        return "normal";
      }
    }
  );
}

// Ibc status (sourceChainId -> counterPartyChainId)
class ObservableQueryWithdrawIbcChainsStatus extends HasMapStore<ObservableQueryIbcChainStatus> {
  constructor(kvStore: KVStore, sourceChainId: string, baseUrl: string) {
    super(
      (counterPartyChainId) =>
        new ObservableQueryIbcChainStatus(
          kvStore,
          baseUrl,
          sourceChainId,
          counterPartyChainId
        )
    );
  }

  get(counterPartyChainId: string): ObservableQueryIbcChainStatus {
    return super.get(counterPartyChainId);
  }
}

// Ibc status (counterPartyChainId -> sourceChainId)
class ObservableQueryDepositIbcChainsStatus extends HasMapStore<ObservableQueryIbcChainStatus> {
  constructor(kvStore: KVStore, sourceChainId: string, baseUrl: string) {
    super(
      (counterPartyChainId) =>
        new ObservableQueryIbcChainStatus(
          kvStore,
          baseUrl,
          counterPartyChainId,
          sourceChainId
        )
    );
  }

  get(counterPartyChainId: string): ObservableQueryIbcChainStatus {
    return super.get(counterPartyChainId);
  }
}

export class ObservableQueryIbcChainsStatus {
  withdrawQueryMapping: ObservableQueryWithdrawIbcChainsStatus;
  depositQueryMapping: ObservableQueryDepositIbcChainsStatus;
  constructor(kvStore: KVStore, sourceChainId: string, baseUrl: string) {
    this.withdrawQueryMapping = new ObservableQueryWithdrawIbcChainsStatus(
      kvStore,
      sourceChainId,
      baseUrl
    );
    this.depositQueryMapping = new ObservableQueryDepositIbcChainsStatus(
      kvStore,
      sourceChainId,
      baseUrl
    );
  }

  @computed
  getIbcStatus(
    direction: "withdraw" | "deposit",
    channelId: string,
    counterPartyChainId: string
  ): IbcStatus | undefined {
    if (direction === "withdraw")
      return this.withdrawQueryMapping
        .get(counterPartyChainId)
        .getIbcStatus(channelId);
    else
      return this.depositQueryMapping
        .get(counterPartyChainId)
        .getIbcStatus(channelId);
  }
}
