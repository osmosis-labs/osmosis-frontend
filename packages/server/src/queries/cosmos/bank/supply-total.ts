import { createNodeQuery } from "../../../queries/base-utils";

export interface SupplyTotal {
  amount: {
    denom: string;
    amount: string;
  };
}

export const querySupplyTotal = createNodeQuery<
  SupplyTotal,
  {
    denom: string;
  }
>({
  path: ({ denom }) => `/cosmos/bank/v1beta1/supply/by_denom?denom=${denom}`,
});
