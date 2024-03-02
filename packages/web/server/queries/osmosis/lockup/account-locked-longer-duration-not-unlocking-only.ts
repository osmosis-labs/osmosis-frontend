import { createNodeQuery } from "../../base-utils";

export type AccountLockedLongerDuration = {
  locks: PeriodLock[];
};

export type PeriodLock = {
  /** Lock ID */
  ID: string;
  owner: string;
  /** In seconds. example: `"604800s"` */
  duration: string;
  /** UTC */
  end_time: string;
  coins: {
    denom: string;
    amount: string;
  }[];
};

/**
 *  NOTE: EXCLUDES unlocking locks.
 *  TODO: add optional duration (in seconds, i.e. `604800s`) param */
export const queryAccountLockedLongerDurationNotUnlockingOnly = createNodeQuery<
  AccountLockedLongerDuration,
  {
    bech32Address: string;
  }
>({
  path: ({ bech32Address }) =>
    `/osmosis/lockup/v1beta1/account_locked_longer_duration_not_unlocking_only/${bech32Address}`,
});
