import { CoinPretty, PricePretty } from "@keplr-wallet/unit";
import { AssetList } from "@osmosis-labs/types";
import cachified, { CacheEntry } from "cachified";
import { LRUCache } from "lru-cache";

import { getAsset } from "../../../queries/complex/assets";
import { Metadata, queryTransactions } from "../../../queries/data-services";
import { DEFAULT_LRU_OPTIONS } from "../../../utils/cache";
import { DEFAULT_VS_CURRENCY } from "../assets/config";
// import { EXAMPLE_TRANSACTION_DATA_BY_DATE } from "./example-transaction-data";

export interface FormattedMetadata {
  value: {
    txFee: {
      token: CoinPretty;
      usd: PricePretty;
    }[];
    txInfo: {
      tokenIn: {
        token: CoinPretty;
        usd: PricePretty;
      };
      tokenOut: {
        token: CoinPretty;
        usd: PricePretty;
      };
    };
    txType: string;
    txMessageIndex: number;
  }[];
  type: string;
}
[];

export interface FormattedTransaction {
  id: string;
  hash: string;
  blockTimestamp: string;
  code: number;
  metadata: FormattedMetadata[];
}

const transactionsCache = new LRUCache<string, CacheEntry>(DEFAULT_LRU_OPTIONS);

// TODO - v2 try / catch the getAssets when there's more data
//  for v1 omit a specific trx if getAsset fails
function mapMetadata(
  metadataArray: Metadata[],
  assetLists: AssetList[]
): FormattedMetadata[] {
  return (
    metadataArray
      .map((metadata) => {
        try {
          return {
            ...metadata,
            value: metadata.value.map((valueItem) => ({
              ...valueItem,
              txFee: valueItem.txFee.map((fee) => {
                try {
                  return {
                    token: new CoinPretty(
                      getAsset({
                        assetLists,
                        anyDenom: fee?.denom,
                      }),
                      fee?.amount
                    ),
                    usd: new PricePretty(DEFAULT_VS_CURRENCY, fee?.usd),
                  };
                } catch (error) {
                  // TODO - clean up in v2
                  throw new Error("Error mapping txFee");
                }
              }),
              txInfo: {
                tokenIn: {
                  token: new CoinPretty(
                    getAsset({
                      assetLists,
                      anyDenom: valueItem.txInfo.tokenIn?.denom,
                    }),
                    valueItem.txInfo.tokenIn?.amount
                  ),
                  usd: new PricePretty(
                    DEFAULT_VS_CURRENCY,
                    valueItem.txInfo.tokenIn?.usd
                  ),
                },
                tokenOut: {
                  token: new CoinPretty(
                    getAsset({
                      assetLists,
                      anyDenom: valueItem.txInfo.tokenOut?.denom,
                    }),
                    valueItem.txInfo.tokenOut?.amount
                  ),
                  usd: new PricePretty(
                    DEFAULT_VS_CURRENCY,
                    valueItem.txInfo.tokenOut?.usd
                  ),
                },
              },
            })),
          };
        } catch (error) {
          // TODO - v2 add potential handler for error, v1 omit row
          return null;
        }
      })
      // filter out any null values or values with empty arrays, indicating an error with getAsset
      .filter((metadata) => metadata !== null) as FormattedMetadata[]
  );
}

export interface GetTransactionsResponse {
  transactions: FormattedTransaction[];
  hasNextPage: boolean;
}

export async function getTransactions({
  address,
  page = "0",
  pageSize = "100",
  assetLists,
}: {
  address: string;
  page?: string;
  pageSize?: string;
  assetLists: AssetList[];
}): Promise<GetTransactionsResponse> {
  return await cachified({
    cache: transactionsCache,
    ttl: 1000 * 60 * 0.25, // 15 seconds since a user can transact quickly
    key: `transactions-${address}-page-${page}-pageSize-${pageSize}`,
    getFreshValue: async () => {
      // TODO - remove this once testing is complete
      // const data = EXAMPLE_TRANSACTION_DATA_BY_DATE as FormattedTransaction[];

      const data = await queryTransactions({
        address,
        page,
        pageSize,
      });

      // if the length of the data is equal to the page size, there is a next page
      const hasNextPage = data?.length === parseInt(pageSize, 10);

      // v1 only display swap transactions
      const filteredSwapTransactions = data?.filter((transaction) => {
        return transaction?.metadata?.some((metadataItem) => {
          // only filter if metadata type is "osmosis-ui"
          if (metadataItem?.type === "osmosis-ui") {
            return metadataItem?.value?.some(
              (valueItem) => valueItem.txType === "swap"
            );
          }
          return false;
        });
      });

      // TODO - wrap getAsset with captureIfError

      const mappedSwapTransactions = filteredSwapTransactions
        .map((transaction) => {
          return {
            id: transaction._id,
            hash: transaction.hash,
            blockTimestamp: transaction.blockTimestamp,
            code: transaction.code,
            metadata: mapMetadata(transaction.metadata, assetLists),
          };
        })
        // filter out transactions with no metadata / empty metadata
        .filter(
          (transaction) =>
            transaction.metadata && transaction.metadata.length > 0
        );

      return {
        transactions: mappedSwapTransactions,
        hasNextPage,
      };
    },
  });
}
