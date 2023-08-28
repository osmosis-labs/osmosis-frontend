import { KVStore } from "@keplr-wallet/common";
import { QueryResponse } from "@keplr-wallet/stores";
import { computed } from "mobx";
import { computedFn } from "mobx-utils";

import {
  ObservableQueryGauge,
  ObservableQueryGauges,
} from "../../queries/incentives";
import { ObservableQueryIncentivizedPools } from "../../queries/pool-incentives";
import { ObservableQueryExternalBase } from "../base";
import { ActiveGauges } from "./types";

/** Queries web server API for active external gauges, and stores returned gauges in ObservableQueryGauge map store.
 *  Replaces manual prior config.
 *
 *  See for rationale: https://github.com/osmosis-labs/osmosis-frontend/issues/1182
 */
export class ObservableQueryActiveGauges extends ObservableQueryExternalBase<ActiveGauges> {
  constructor(
    kvStore: KVStore,
    baseURL: string,
    protected readonly queryGauge: ObservableQueryGauges,
    protected readonly incentivizedPools: ObservableQueryIncentivizedPools
  ) {
    super(kvStore, baseURL, "/api/active-gauges");
  }

  readonly get = computedFn((gaugeId: string) => {
    const isInternalGauge =
      this.incentivizedPools.isGaugeIdInternalIncentive(gaugeId);
    if (
      this.response?.data?.data.some(({ id }) => id === gaugeId) ||
      isInternalGauge
    ) {
      return this.queryGauge.get(gaugeId);
    }
  });

  protected setResponse(response: Readonly<QueryResponse<ActiveGauges>>) {
    super.setResponse(response);
    // set gauges in the gauge map store
    response.data.data.forEach((gauge) => this.queryGauge.setWithGauge(gauge));
  }

  /** Active external gauges for a given pool. */
  readonly getExternalGaugesForPool = computedFn((poolId: string) => {
    return (
      this.response?.data?.data
        .filter((gauge) => {
          if (gauge.distribute_to.denom.includes("gamm/pool/")) {
            const distributePoolId = gauge.distribute_to.denom.split("/")[2];
            return poolId === distributePoolId;
          }

          if (gauge.distribute_to.denom.includes("cl/pool/")) {
            const distributePoolId = gauge.distribute_to.denom.split("/")[2];
            return poolId === distributePoolId;
          }

          return false;
        })
        .map((gauge) => this.get(gauge.id))
        .filter(
          (gauge): gauge is ObservableQueryGauge => gauge !== undefined
        ) ?? []
    );
  });

  /** Returns a unique list of pool IDs encountered in the currently active gauges. */
  @computed
  get poolIdsForActiveGauges() {
    const poolIds = new Set<string>();

    this.response?.data?.data.forEach((gauge) => {
      const poolId = gauge.distribute_to.denom.split("/")[2];

      const poolIdParsed = parseInt(poolId);
      if (!isNaN(poolIdParsed) && poolIdParsed > 0) {
        poolIds.add(poolId);
      }
    });

    return Array.from(poolIds);
  }
}
