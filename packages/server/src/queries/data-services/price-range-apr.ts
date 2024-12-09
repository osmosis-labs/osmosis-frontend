import { apiClient } from "@osmosis-labs/utils";

import { HISTORICAL_DATA_URL } from "../../env";

interface PriceRangeAPR {
  APR: number;
}

export async function queryPriceRangeApr({
  poolId,
  upperTickIndex,
  lowerTickIndex,
}: {
  poolId: string;
  upperTickIndex: string;
  lowerTickIndex: string;
}): Promise<PriceRangeAPR> {
  const url = new URL(
    `/cl/v1/apr/rewards/${poolId}?lower_tick=${lowerTickIndex}&upper_tick=${upperTickIndex}`,
    HISTORICAL_DATA_URL
  );

  return await apiClient<PriceRangeAPR>(url.toString());
}
