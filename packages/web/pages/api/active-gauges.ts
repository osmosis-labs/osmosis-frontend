import type { NextApiRequest, NextApiResponse } from "next";
import { Gauge } from "@osmosis-labs/stores/build/queries/incentives/types";

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
  const resp = await fetch(
    "https://lcd.osmosis.zone/osmosis/incentives/v1beta1/active_gauges?pagination.limit=100000"
  );
  const { data } = (await resp.json()) as ExternalIncentiveGaugesResponse;

  res.setHeader("Cache-Control", "s-maxage=900, stale-while-revalidate"); // 15 minute cache
  res.status(200).json({
    data: data.filter(
      (gauge) =>
        !gauge.is_perpetual &&
        gauge.distribute_to.denom.match(/gamm\/pool\/[0-9]+/m) && // only gamm share incentives
        !gauge.coins.some((coin) => coin.denom.match(/gamm\/pool\/[0-9]+/m)) // no gamm share rewards
    ),
  });
}
