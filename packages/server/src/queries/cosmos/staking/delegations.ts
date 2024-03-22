// "/osmosis/concentratedliquidity/v1beta1"/positions/${bech32Address}?pagination.limit=10000

import { createNodeQuery } from "../../../queries/base-utils";

export type Delegations = {
  delegation_responses: Delegation[];
};

export type Delegation = {
  delegation: {
    delegator_address: string;
    validator_address: string;
    // Dec
    shares: string;
  };
  balance: {
    denom: string;
    amount: string;
  };
};

export const queryDelegations = createNodeQuery<
  Delegations,
  {
    bech32Address: string;
  }
>({
  path: ({ bech32Address }) =>
    `/cosmos/staking/v1beta1/delegations/${bech32Address}`,
});
