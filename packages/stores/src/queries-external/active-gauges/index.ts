import { computed } from "mobx";
import { computedFn } from "mobx-utils";
import { KVStore } from "@keplr-wallet/common";
import { QueryResponse } from "@keplr-wallet/stores";
import { ObservableQueryExternalBase } from "../base";
import { ActiveGauges } from "./types";
import { ObservableQueryGauge } from "../../queries/incentives";

/** Queries web server API for active external gauges, and stores returned gauges in ObservableQueryGauge map store.
 *  Replaces manual prior config.
 *
 *  See for rationale: https://github.com/osmosis-labs/osmosis-frontend/issues/1182
 */
export class ObservableQueryActiveGauges extends ObservableQueryExternalBase<ActiveGauges> {
  constructor(
    kvStore: KVStore,
    baseURL: string,
    protected readonly queryGauge: ObservableQueryGauge
  ) {
    super(kvStore, baseURL, "/api/active-gauges");
  }

  protected setResponse(response: Readonly<QueryResponse<ActiveGauges>>) {
    super.setResponse(response);

    // set gauges in the gauge map store
    response.data.data.forEach((gauge) => this.queryGauge.setWithGauge(gauge));
  }

  /** Active external gauges for a given pool. */
  readonly getExternalGaugesForPool = computedFn((poolId: string) => {
    return this.response?.data?.data
      .filter((gauge) => gauge.distribute_to.denom.includes(poolId))
      .map((gauge) => this.queryGauge.get(gauge.id));
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
