import { createNodeQuery } from "../../base-utils";
import { SyntheticLock } from "./types";

export type SyntheticLockups = {
  synthetic_locks: SyntheticLock[];
};

export const querySyntheticLockupsByLockId = createNodeQuery<
  SyntheticLockups,
  {
    lockId: string;
  }
>({
  path: ({ lockId }) =>
    `/osmosis/lockup/v1beta1/synthetic_lockups_by_lock_id/${lockId}`,
});
