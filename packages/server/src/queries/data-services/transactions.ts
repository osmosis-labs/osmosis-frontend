import { apiClient } from "@osmosis-labs/utils";

import { Transaction } from "../complex/transactions/transaction-types";

export async function queryTransactions({
  address,
  page,
  pageSize,
}: {
  address: string;
  page: string;
  pageSize: string;
}): Promise<Transaction[]> {
  // TODO update URL
  const url = new URL(`https://osmosis.numia.xyz/v2/txs/${address}`);

  url.searchParams.append("page", page);
  url.searchParams.append("pageSize", pageSize);

  const headers = {
    Authorization: `Bearer ${process.env.NEXT_PUBLIC_NUMIA_API_KEY}`,
  };

  return apiClient<Transaction[]>(url.toString(), { headers });
}
