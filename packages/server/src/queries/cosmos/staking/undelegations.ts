// "/osmosis/concentratedliquidity/v1beta1"/positions/${bech32Address}?pagination.limit=10000

import { createNodeQuery } from "../../create-node-query";

export type UnbondingResponses = {
  unbonding_responses: UnbondingResponse[];
};

export type UnbondingResponse = {
  delegator_address: string;
  validator_address: string;
  entries: UnbondingEntry[];
};

export type UnbondingEntry = {
  creation_height: string;
  completion_time: string;
  initial_balance: string;
  balance: string;
  unbonding_id: string;
  unbonding_on_hold_ref_count: string;
};

export const queryUndelegations = createNodeQuery<
  UnbondingResponses,
  {
    bech32Address: string;
  }
>({
  path: ({ bech32Address }) =>
    `/cosmos/staking/v1beta1/delegators/${bech32Address}/unbonding_delegations`,
});
