export type ConcentratedPoolAccountPositionRecord = {
  validator_address: string;
  position_id: string;
  lock_id: string;
  delegation_amount: {
    denom: string;
    amount: string;
  };
  equivalent_staked_amount: {
    amount: string;
    denom: string;
  };
};

export type AccountDelegatedClPositionsResponse = {
  cl_pool_user_position_records: ConcentratedPoolAccountPositionRecord[];
};
