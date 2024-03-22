import { createNodeQuery } from "../../base-utils";
import { SuperfluidDelegationRecord } from "./types";

export type SuperfluidDelegations = {
  superfluid_delegation_records: SuperfluidDelegationRecord[];
  total_delegated_coins: [
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
};

export const querySuperfluidDelegations = createNodeQuery<
  SuperfluidDelegations,
  {
    bech32Address: string;
  }
>({
  path: ({ bech32Address }) =>
    `/osmosis/superfluid/v1beta1/superfluid_delegations/${bech32Address}`,
});
