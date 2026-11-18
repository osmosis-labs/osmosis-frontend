import { Chain } from "@osmosis-labs/types";

import { createNodeQuery } from "../../create-node-query";

export type QueryBalancesResponse = {
  balances: {
    denom: string;
    amount: string;
  }[];
};

type QueryBalancesPageResponse = QueryBalancesResponse & {
  pagination?: { next_key?: string | null };
};

/** Safety cap on pages followed (1000 denoms each). */
const MAX_BALANCE_PAGES = 20;

const queryBalancesPage = createNodeQuery<
  QueryBalancesPageResponse,
  {
    bech32Address: string;
    paginationKey?: string;
  }
>({
  path: ({ bech32Address, paginationKey }) =>
    `/cosmos/bank/v1beta1/balances/${bech32Address}?pagination.limit=1000${
      paginationKey
        ? `&pagination.key=${encodeURIComponent(paginationKey)}`
        : ""
    }`,
});

/** Queries all balances of an address, following `next_key` so wallets with
 *  more than 1000 denoms (e.g. dusted with tokenfactory denoms, which sort
 *  before `ibc/` and `uosmo`) still return every balance. A single request is
 *  made when everything fits in one page. */
export async function queryBalances(params: {
  bech32Address: string;
  chainId?: string;
  chainList: Chain[];
}): Promise<QueryBalancesResponse> {
  const balances: QueryBalancesResponse["balances"] = [];
  let paginationKey: string | undefined;

  for (let page = 0; page < MAX_BALANCE_PAGES; page++) {
    const response = await queryBalancesPage({ ...params, paginationKey });
    balances.push(...response.balances);

    const nextKey = response.pagination?.next_key;
    if (!nextKey) return { balances };
    paginationKey = nextKey;
  }

  console.warn(
    `Balances for ${params.bech32Address} exceed ${MAX_BALANCE_PAGES} pages, returning partial results`
  );
  return { balances };
}
