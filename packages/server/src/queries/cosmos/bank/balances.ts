import { createNodeQuery } from "../../create-node-query";

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
  path: ({ bech32Address }) =>
    `/cosmos/bank/v1beta1/balances/${bech32Address}?pagination.limit=1000`,
});
