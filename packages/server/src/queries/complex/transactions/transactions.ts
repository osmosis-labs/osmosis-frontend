import cachified, { CacheEntry } from "cachified";
import { LRUCache } from "lru-cache";

// import { queryTransactions } from "../../../queries/data-services/transactions";
import { DEFAULT_LRU_OPTIONS } from "../../../utils/cache";
import { EXAMPLE_TRANSACTION_DATA } from "./example-transaction-data";

const transactionsCache = new LRUCache<string, CacheEntry>(DEFAULT_LRU_OPTIONS);
/** Gets the numerical market cap rank given a token symbol/denom.
 *  Returns `undefined` if a market cap is not available for the given symbol/denom. */
export async function getTransactions({
  address,
  page = 1,
  pageSize = 100,
}: {
  address: string;
  page?: number;
  pageSize?: number;
  // TODO update return type
}): Promise<any> {
  return await cachified({
    cache: transactionsCache,
    ttl: 1000 * 60 * 1, // 1 minute since a user can change their staking APR at any time
    key: `transactions-${address}-page-${1}-pageSize-${pageSize}`,
    getFreshValue: async () => {
      try {
        const data = EXAMPLE_TRANSACTION_DATA;

        // const data = await queryTransactions({
        //   address,
        //   page: page.toString(),
        //   pageSize: pageSize.toString(),
        // });

        // v1 only display swap transactions
        const swapTransactions = data.filter((transaction) =>
          transaction.metadata.some((metadataItem) =>
            metadataItem.value.some((valueItem) => valueItem.txType === "swap")
          )
        );

        return swapTransactions;
      } catch {
        return [];
      }
    },
  });
}
