export type SyntheticLock = {
  duration: string;
  end_time: string;
  synth_denom: string;
  underlying_lock_id: string;
};

export type AccountCoins = {
  coins: {
    denom: string;
    amount: string;
  }[];
};
