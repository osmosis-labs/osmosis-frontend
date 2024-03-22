import { createNodeQuery } from "../../../queries/base-utils";

export type QueryBalancesResponse = {
  balances: {
    denom: string;
    amount: string;
  }[];
};

export const queryBalances = createNodeQuery<
  QueryBalancesResponse,
  {
    bech32Address: string;
  }
>({
  path: ({ bech32Address }) => `/cosmos/bank/v1beta1/balances/${bech32Address}`,
});
