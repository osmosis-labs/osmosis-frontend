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
  locks: {
    ID: string;
    owner: string;
    duration: string;
    end_time: string;
    coins: {
      denom: string;
      amount: string;
    }[];
  }[];
};
