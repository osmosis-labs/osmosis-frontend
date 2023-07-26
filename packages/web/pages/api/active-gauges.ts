import { Epochs } from "@osmosis-labs/stores/build/queries/epochs/types";
import { Gauge } from "@osmosis-labs/stores/build/queries/incentives/types";
import type { NextApiRequest, NextApiResponse } from "next";

import { ChainInfos } from "../../config";

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
  const endpoint = `${ChainInfos[0].rest}osmosis/incentives/v1beta1/gauges?pagination.limit=100000`;
  const resp = await fetch(endpoint);
  const { data } = (await resp.json()) as ExternalIncentiveGaugesResponse;

  const epochs_endpoint = `${ChainInfos[0].rest}osmosis/epochs/v1beta1/epochs`;
  const epoch_resp = await fetch(epochs_endpoint);
  const { epochs } = (await epoch_resp.json()) as Epochs;

  res.setHeader("Cache-Control", "s-maxage=900, stale-while-revalidate"); // 15 minute cache
  res.status(200).json({
    data: data.filter(
      (gauge) =>
        !gauge.is_perpetual &&
        gauge.distribute_to.denom.match(/gamm\/pool\/[0-9]+/m) && // only gamm share incentives
        !gauge.coins.some((coin) => coin.denom.match(/gamm\/pool\/[0-9]+/m)) && // no gamm share rewards
        gauge.filled_epochs != gauge.num_epochs_paid_over && // no completed gauges
        checkForStaleness(gauge, parseInt(data[data.length - 1].id), epochs)
    ),
  });
}

const DURATION_1_DAY = 86400000;
const MAX_NEW_GAUGES_PER_DAY = 100;

function checkForStaleness(
  gauge: Gauge,
  lastGaugeId: number,
  epochs: Epochs["epochs"]
) {
  let parsedGaugeStartTime = Date.parse(gauge.start_time);

  const NOW = Date.now();
  const CURRENT_EPOCH_START_TIME = Date.parse(
    epochs[0].current_epoch_start_time
  );

  return (
    gauge.distributed_coins.length > 0 ||
    (parsedGaugeStartTime > NOW - DURATION_1_DAY &&
      parsedGaugeStartTime < CURRENT_EPOCH_START_TIME + DURATION_1_DAY) ||
    (parsedGaugeStartTime < NOW &&
      parseInt(gauge.id) > lastGaugeId - MAX_NEW_GAUGES_PER_DAY)
  );
}
