import { apiClient } from "@osmosis-labs/utils";

import { ChainList } from "~/config/generated/chain-list";

interface LockableDurations {
  lockable_durations: string[];
}

export function queryLockableDurations(): Promise<LockableDurations> {
  const url = new URL(
    "/osmosis/pool-incentives/v1beta1/lockable_durations",
    ChainList[0].apis.rest[0].address
  );
  return apiClient<LockableDurations>(url.toString());
}
