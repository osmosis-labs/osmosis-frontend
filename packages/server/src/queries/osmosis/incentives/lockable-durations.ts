import { createNodeQuery } from "../../../queries/base-utils";

interface LockableDurations {
  lockable_durations: string[];
}

export const queryLockableDurations = createNodeQuery<LockableDurations>({
  path: "/osmosis/pool-incentives/v1beta1/lockable_durations",
});
