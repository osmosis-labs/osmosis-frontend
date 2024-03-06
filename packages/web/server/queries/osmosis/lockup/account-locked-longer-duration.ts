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
  /** UTC. If not currently unlocking, will return `0` for `Date.getFullYear`
   *  Ex: `new Date("0001-01-01T00:00:00Z").getFullYear() === 0`
   */
  end_time: string;
  coins: {
    denom: string;
    amount: string;
  }[];
};

/**
 *  NOTE: includes unlocking locks.
 *
 *  TODO: add optional duration (in seconds, i.e. `604800s`) param */
export const queryAccountLockedLongerDuration = createNodeQuery<
  AccountLockedLongerDuration,
  {
    bech32Address: string;
  }
>({
  path: ({ bech32Address }) =>
    `/osmosis/lockup/v1beta1/account_locked_longer_duration/${bech32Address}`,
});
