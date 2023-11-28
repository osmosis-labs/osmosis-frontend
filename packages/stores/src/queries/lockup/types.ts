export type AccountLockedCoins = {
  coins: { denom: string; amount: string }[];
};

export type AccountUnlockingCoins = {
  coins: { denom: string; amount: string }[];
};

export type AccountUnlockableCoins = {
  coins: { denom: string; amount: string }[];
};

export type AccountLockedLongerDuration = {
  locks: PeriodLock[];
};

export type SyntheticLockupsByLockId = {
  synthetic_locks: {
    underlying_lock_id: string;
    synth_denom: string;
    end_time: string;
    duration: string;
  }[];
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
