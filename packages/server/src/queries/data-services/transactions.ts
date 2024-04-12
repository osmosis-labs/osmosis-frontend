import { apiClient } from "@osmosis-labs/utils";

import { NUMIA_BASE_URL } from "../../env";
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
  const url = new URL(`/v2/txs/${address}`, NUMIA_BASE_URL);

  url.searchParams.append("page", page);
  url.searchParams.append("pageSize", pageSize);

  const headers = {
    Authorization: `Bearer ${process.env.NEXT_PUBLIC_NUMIA_API_KEY}`,
  };

  return apiClient<Transaction[]>(url.toString(), { headers });
}
