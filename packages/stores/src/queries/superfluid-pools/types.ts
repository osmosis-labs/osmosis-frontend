import { CoinPretty } from "@keplr-wallet/unit";
import { Duration } from "dayjs/plugin/duration";

export type SuperfluidParams = {
  params: {
    // Dec
    minimum_risk_factor: string;
  };
};

export type SuperfluidAssetMultiplier = {
  osmo_equivalent_multiplier: {
    // Int
    epoch_number: string;
    denom: string;
    // Dec
    multiplier: string;
  };
};

export type SuperfluidAllAssets = {
  assets: [
    {
      denom: string;
      asset_type: string;
    }
  ];
};

export type SuperfluidDelegationRecordsResponse = {
  delegator_address: string;
  validator_address: string;
  delegation_amount: {
    denom: string;
    amount: string;
  };
};

export type SuperfluidDelegationsResponse = {
  superfluid_delegation_records: SuperfluidDelegationRecordsResponse[];
  total_undelegated_coins: [
    {
      denom: string;
      amount: string;
    }
  ];
};

export type SuperfluidDelegation = {
  delegator_address: string;
  validator_address: string;
  amount: CoinPretty;
};

export type SuperfluidUndelegationRecordsResponse = {
  delegator_address: string;
  validator_address: string;
  delegation_amount: {
    denom: string;
    amount: string;
  };
};

export type SuperfluidUndelegationsResponse = {
  superfluid_delegation_records: SuperfluidUndelegationRecordsResponse[];
  synthetic_locks: [
    {
      duration: string;
      end_time: string;
      synth_denom: string;
      underlying_lock_id: string;
    }
  ];
  total_delegated_coins: [
    {
      denom: string;
      amount: string;
    }
  ];
};

export type SuperfluidUndelegation = {
  delegator_address: string;
  validator_address: string;
  amount: CoinPretty;
  duration: Duration;
  end_time: Date;
  lock_id: string;
};

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
