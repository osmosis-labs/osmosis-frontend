import cachified, { CacheEntry } from "cachified";
import { LRUCache } from "lru-cache";

// TODO update this AssetsList with ctx
import { AssetLists } from "../../../queries/__tests__/mock-asset-lists";
import { getAsset } from "../../../queries/complex/assets";
// import { queryTransactions } from "../../../queries/data-services/transactions";
import { DEFAULT_LRU_OPTIONS } from "../../../utils/cache";
import { EXAMPLE_TRANSACTION_DATA } from "./example-transaction-data";
import { Metadata, Transaction } from "./transaction-types";

const transactionsCache = new LRUCache<string, CacheEntry>(DEFAULT_LRU_OPTIONS);
/** Gets the numerical market cap rank given a token symbol/denom.
 *  Returns `undefined` if a market cap is not available for the given symbol/denom. */

// TODO - extend this to cover RatePretty and PricePretty
function mapData(metadataArray: Metadata[]) {
  return metadataArray.map((metadata) => ({
    ...metadata,
    value: metadata.value.map((valueItem) => ({
      ...valueItem,
      txFee: valueItem.txFee.map((fee) => ({
        ...fee,
        denom: getAsset({ assetLists: AssetLists, anyDenom: fee.denom }),
      })),
      txInfo: {
        tokenIn: {
          ...valueItem.txInfo.tokenIn,
          denom: getAsset({
            assetLists: AssetLists,
            anyDenom: valueItem.txInfo.tokenIn.denom,
          }),
        },
        tokenOut: {
          ...valueItem.txInfo.tokenOut,
          denom: getAsset({
            assetLists: AssetLists,
            anyDenom: valueItem.txInfo.tokenOut.denom,
          }),
        },
      },
    })),
  }));
}

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
    key: `transactions-${address}-page-${page}-pageSize-${pageSize}`,
    getFreshValue: async () => {
      try {
        const data = EXAMPLE_TRANSACTION_DATA as Transaction[];

        // const data = await queryTransactions({
        //   address,
        //   page: page.toString(),
        //   pageSize: pageSize.toString(),
        // });

        // v1 only display swap transactions
        const filteredSwapTransactions = data.filter((transaction) =>
          transaction.metadata.some((metadataItem) =>
            metadataItem.value.some((valueItem) => valueItem.txType === "swap")
          )
        );

        const mappedSwapTransactions = filteredSwapTransactions.map(
          (transaction) => {
            return {
              id: transaction._id,
              blockTimestamp: transaction.blockTimestamp,
              code: transaction.code,
              metadata: mapData(transaction.metadata),
            };
          }
        );

        return mappedSwapTransactions;
      } catch {
        return [];
      }
    },
  });
}
