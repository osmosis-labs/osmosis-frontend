export interface ConcentratedPoolAccountPositionRecord {
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
}
