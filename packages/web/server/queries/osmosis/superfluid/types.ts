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
  } | null;
}

export type SuperfluidDelegationRecord = {
  delegator_address: string;
  validator_address: string;
  delegation_amount: {
    denom: string;
    amount: string;
  };
  /** OSMO equivalent staked amount. */
  equivalent_staked_amount: {
    amount: string;
    denom: string;
  };
};
