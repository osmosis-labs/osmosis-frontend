import { apiClient } from "@osmosis-labs/utils";

import { ChainList } from "~/config/generated/chain-list";

interface EpochProvisions {
  epoch_provisions: string;
}

export async function queryEpochProvisions(): Promise<EpochProvisions> {
  const url = new URL(
    "/osmosis/mint/v1beta1/epoch_provisions",
    ChainList[0].apis.rest[0].address
  );
  return apiClient<EpochProvisions>(url.toString());
}
