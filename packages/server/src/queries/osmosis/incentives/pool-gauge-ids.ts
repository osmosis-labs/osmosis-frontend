import { createNodeQuery } from "../../create-node-query";

export type PoolGaugeIds = {
  gauge_ids_with_duration: {
    gauge_id: string;
    duration: string;
    /** Dec, percentage of the pool incentives allocated to this pool. */
    gauge_incentive_percentage: string;
  }[];
};

export const queryPoolGaugeIds = createNodeQuery<
  PoolGaugeIds,
  { poolId: string }
>({
  path: ({ poolId }) => `/osmosis/pool-incentives/v1beta1/gauge-ids/${poolId}`,
});
