import { BondStatus } from "@osmosis-labs/types";
import { apiClient } from "@osmosis-labs/utils";

import { ChainList } from "~/config/generated/chain-list";

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

export async function queryValidators({
  status,
  paginationLimit = 1000,
}: {
  status: BondStatus;
  paginationLimit?: number;
}): Promise<Validators> {
  const url = new URL(
    `/cosmos/staking/v1beta1/validators?pagination.limit=${paginationLimit}&status=${(() => {
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
    })()}`,
    ChainList[0].apis.rest[0].address
  );

  return apiClient<Validators>(url.toString());
}
