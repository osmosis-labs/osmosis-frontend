import { apiClient } from "@osmosis-labs/utils";

import { INDEXER_DATA_URL } from "../../env";

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
    INDEXER_DATA_URL
  );

  return await apiClient<PriceRangeAPR>(url.toString());
}
