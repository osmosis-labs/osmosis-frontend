import { Gauge } from "@osmosis-labs/stores/build/queries/incentives/types";
import type { NextApiRequest, NextApiResponse } from "next";

import { getActiveGauges } from "~/server/queries/complex/pools/incentives";

type ExternalIncentiveGaugesResponse = {
  data: Gauge[];
};

/** Filters for active external gauges from chain query.
 *
 *  See rationale here: https://github.com/osmosis-labs/osmosis-frontend/issues/1182
 */
export default async function activeGauges(
  _req: NextApiRequest,
  res: NextApiResponse<ExternalIncentiveGaugesResponse>
) {
  const gauges = await getActiveGauges();

  res.setHeader("Cache-Control", "s-maxage=900, stale-while-revalidate"); // 15 minute cache
  res.status(200).json({
    data: gauges.map((gauge) => ({
      ...gauge,
      start_time: gauge.start_time.toISOString(),
      distribute_to: {
        ...gauge.distribute_to,
        duration: gauge.distribute_to.duration.asSeconds() + "s",
      },
    })),
  });
}
