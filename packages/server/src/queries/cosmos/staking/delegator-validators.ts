import { createNodeQuery } from "../../create-node-query";
import type { Validator } from "./validators";

export type DelegatorValidators = {
  validators: Validator[];
};

/** Every validator the delegator has a delegation with, whatever its bond
 *  status. The page size defaults to 100, so the limit is raised well above
 *  the number of validators a user can delegate to. */
export const queryDelegatorValidators = createNodeQuery<
  DelegatorValidators,
  {
    bech32Address: string;
  }
>({
  path: ({ bech32Address }) =>
    `/cosmos/staking/v1beta1/delegators/${bech32Address}/validators?pagination.limit=1000`,
});
