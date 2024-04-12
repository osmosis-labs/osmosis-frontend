import { CoinPretty, PricePretty } from "@keplr-wallet/unit";
import { AssetList } from "@osmosis-labs/types";
import cachified, { CacheEntry } from "cachified";
import { LRUCache } from "lru-cache";

import { getAsset } from "../../../queries/complex/assets";
import { queryTransactions } from "../../../queries/data-services/transactions";
import { DEFAULT_LRU_OPTIONS } from "../../../utils/cache";
import { DEFAULT_VS_CURRENCY } from "../assets/config";
import {
  MappedTransaction,
  MappedTransactionMetadata,
  TransactionMetadata,
} from "./transaction-types";

const transactionsCache = new LRUCache<string, CacheEntry>(DEFAULT_LRU_OPTIONS);

// TODO - try / catch the getAssets - for v1 omit a specific trx if getAsset fails
// TODO - try / catch in the map
function mapMetadata(
  metadataArray: TransactionMetadata[],
  assetLists: AssetList[]
): MappedTransactionMetadata[] {
  return metadataArray.map((metadata) => ({
    ...metadata,
    value: metadata.value.map((valueItem) => ({
      ...valueItem,
      txFee: valueItem.txFee.map((fee) => ({
        token: new CoinPretty(
          getAsset({
            assetLists,
            anyDenom: fee.denom,
          }),
          fee.amount
        ),
        usd: new PricePretty(DEFAULT_VS_CURRENCY, fee.usd),
      })),
      txInfo: {
        tokenIn: {
          // TODO - combine into token key
          token: new CoinPretty(
            getAsset({
              assetLists,
              anyDenom: valueItem.txInfo.tokenIn.denom,
            }),
            valueItem.txInfo.tokenIn.amount
          ),
          usd: new PricePretty(
            DEFAULT_VS_CURRENCY,
            valueItem.txInfo.tokenIn.usd
          ),
        },
        tokenOut: {
          // TODO - combine into token key
          token: new CoinPretty(
            getAsset({
              assetLists,
              anyDenom: valueItem.txInfo.tokenOut.denom,
            }),
            valueItem.txInfo.tokenOut.amount
          ),
          usd: new PricePretty(
            DEFAULT_VS_CURRENCY,
            valueItem.txInfo.tokenOut.usd
          ),
        },
      },
    })),
  }));
}

export async function getTransactions({
  address,
  page = 1,
  pageSize = 100,
  assetLists,
}: {
  address: string;
  page?: number;
  pageSize?: number;
  assetLists: AssetList[];
}): Promise<MappedTransaction[]> {
  return await cachified({
    cache: transactionsCache,
    ttl: 1000 * 60 * 0.25, // 15 seconds since a user can transact quickly
    key: `transactions-${address}-page-${page}-pageSize-${pageSize}`,
    getFreshValue: async () => {
      // TODO - remove this once testing is complete
      // const data = EXAMPLE_TRANSACTION_DATA as Transaction[];

      const data = await queryTransactions({
        address,
        page: page.toString(),
        pageSize: pageSize.toString(),
      });

      // v1 only display swap transactions
      const filteredSwapTransactions = data.filter((transaction) =>
        transaction.metadata.some((metadataItem) =>
          metadataItem.value.some((valueItem) => valueItem.txType === "swap")
        )
      );

      // TODO - wrap getAsset with captureIfError

      const mappedSwapTransactions = filteredSwapTransactions.map(
        (transaction) => {
          return {
            id: transaction._id,
            hash: transaction.hash,
            blockTimestamp: transaction.blockTimestamp,
            code: transaction.code,
            metadata: mapMetadata(transaction.metadata, assetLists),
          };
        }
      );

      return mappedSwapTransactions;
    },
  });
}
