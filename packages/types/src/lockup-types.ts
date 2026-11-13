export type AccountLockedLongerDuration = {
  locks: PeriodLock[];
};

export type PeriodLock = {
  ID: string;
  owner: string;
  duration: string;
  /** UTC */
  end_time: string;
  coins: {
    denom: string;
    amount: string;
  }[];
};
