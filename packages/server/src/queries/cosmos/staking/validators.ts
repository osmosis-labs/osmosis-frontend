import { BondStatus } from "@osmosis-labs/types";

import { createNodeQuery } from "../../../queries/base-utils";

type Validator = {
  operator_address: string;
  consensus_pubkey: {
    "@type": string;
    // Base64
    key: string;
  };
  jailed: boolean;
  status:
    | "BOND_STATUS_UNSPECIFIED"
    | "BOND_STATUS_UNBONDED"
    | "BOND_STATUS_UNBONDING"
    | "BOND_STATUS_BONDED";
  // Int
  tokens: string;
  // Dec
  delegator_shares: string;
  description: {
    moniker?: string;
    identity?: string;
    website?: string;
    security_contact?: string;
    details?: string;
  };
  unbonding_height: string;
  unbonding_time: string;
  commission: {
    commission_rates: {
      // Dec
      rate: string;
      // Dec
      max_rate: string;
      // Dec
      max_change_rate: string;
    };
    update_time: string;
  };
  // Int
  min_self_delegation: string;
};

type Validators = {
  validators: Validator[];
};

export const queryValidators = createNodeQuery<
  Validators,
  {
    status: BondStatus;
    paginationLimit?: number;
  }
>({
  path: ({ status, paginationLimit = 1000 }) => {
    return `/cosmos/staking/v1beta1/validators?pagination.limit=${paginationLimit}&status=${(() => {
      switch (status) {
        case BondStatus.Bonded:
          return "BOND_STATUS_BONDED";
        case BondStatus.Unbonded:
          return "BOND_STATUS_UNBONDED";
        case BondStatus.Unbonding:
          return "BOND_STATUS_UNBONDING";
        default:
          return "BOND_STATUS_UNSPECIFIED";
      }
    })()}`;
  },
});
