import { type Gauge, getActiveGauges } from "@osmosis-labs/server";

import { ChainList } from "~/config/generated/chain-list";

type ExternalIncentiveGaugesResponse = {
  data: Gauge[];
};

/** Filters for active external gauges from chain query.
 *
 *  See rationale here: https://github.com/osmosis-labs/osmosis-frontend/issues/1182
 */
export async function activeGaugesHandler() {
  const gauges = await getActiveGauges({ chainList: ChainList });

  const response: ExternalIncentiveGaugesResponse = {
    data: gauges.map((gauge) => ({
      ...gauge,
      start_time: gauge.start_time.toISOString(),
      distribute_to: {
        ...gauge.distribute_to,
        duration: gauge.distribute_to.duration.asSeconds() + "s",
      },
    })),
  };
  return Response.json(response, {
    headers: { "Cache-Control": "s-maxage=900, stale-while-revalidate" }, // 15 minute cache
  });
}
