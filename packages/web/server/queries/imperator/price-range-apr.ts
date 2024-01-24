import { apiClient } from "@osmosis-labs/utils";

import { IMPERATOR_INDEXER_DEFAULT_BASEURL } from ".";

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
    IMPERATOR_INDEXER_DEFAULT_BASEURL
  );

  return await apiClient<PriceRangeAPR>(url.toString());
}
