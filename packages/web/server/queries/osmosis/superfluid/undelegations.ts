import { createNodeQuery } from "../../base-utils";
import { SuperfluidDelegationRecord, SyntheticLock } from "./types";

export type SuperfluidDelegations = {
  superfluid_delegation_records: SuperfluidDelegationRecord[];
  total_undelegated_coins: [
    {
      denom: string;
      amount: string;
    }
  ];
  /** OSMO equivalent staked amount. */
  total_equivalent_staked_amount: {
    amount: string;
    denom: string;
  };
  synthetic_locks: SyntheticLock[];
};

export const querySuperfluidUnelegations = createNodeQuery<
  SuperfluidDelegations,
  {
    bech32Address: string;
  }
>({
  path: ({ bech32Address }) =>
    `/osmosis/superfluid/v1beta1/superfluid_undelegations_by_delegator/${bech32Address}`,
});
