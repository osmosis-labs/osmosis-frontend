import { AssetList, Chain } from "@osmosis-labs/types";
import { CoinPretty, PricePretty } from "@osmosis-labs/unit";
import cachified, { CacheEntry } from "cachified";
import { LRUCache } from "lru-cache";

import { IS_TESTNET } from "../../../env";
import { getAsset } from "../../../queries/complex/assets";
import {
  Metadata,
  queryTransactions,
  Transaction,
} from "../../../queries/data-services";
import { DEFAULT_LRU_OPTIONS } from "../../../utils/cache";
import { DEFAULT_VS_CURRENCY } from "../assets/config";
import {
  FormattedTransfer,
  IBC_OUTCOME_MESSAGE_TYPES,
  mapTransfers,
  resolveAxelarTransfers,
  settleIbcWithdrawals,
} from "./transfers";

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
  /** Bridge/IBC transfers, so history isn't limited to the browser that made them. */
  transfers: FormattedTransfer[];
  hasNextPage: boolean;
}

export const TRANSACTION_TYPES = ["swap", "deposit", "withdraw"] as const;
export type TransactionType = (typeof TRANSACTION_TYPES)[number];

/**
 * Index message types per transaction type. The historical data service
 * filters by message type, so type filters apply across all pages.
 */
const MESSAGE_TYPES_BY_TRANSACTION_TYPE: Record<TransactionType, string[]> = {
  swap: [
    "/osmosis.poolmanager.v1beta1.MsgSwapExactAmountIn",
    "/osmosis.poolmanager.v1beta1.MsgSplitRouteSwapExactAmountIn",
    "/osmosis.poolmanager.v1beta1.MsgSwapExactAmountOut",
    "/osmosis.poolmanager.v1beta1.MsgSplitRouteSwapExactAmountOut",
  ],
  deposit: ["/ibc.core.channel.v1.MsgRecvPacket"],
  // Skip and Squid withdrawals are contract calls
  withdraw: [
    "/ibc.applications.transfer.v1.MsgTransfer",
    "/cosmwasm.wasm.v1.MsgExecuteContract",
  ],
};

export async function getTransactions({
  address,
  page = "0",
  pageSize = "100",
  assetLists,
  chainList,
  types = TRANSACTION_TYPES,
}: {
  address: string;
  page?: string;
  pageSize?: string;
  assetLists: AssetList[];
  chainList: Chain[];
  /** Only these transaction types; all by default. */
  types?: readonly TransactionType[];
}): Promise<GetTransactionsResponse> {
  const selectedTypes = TRANSACTION_TYPES.filter((type) =>
    types.includes(type)
  );
  return await cachified({
    cache: transactionsCache,
    ttl: 1000 * 60 * 0.25, // 15 seconds since a user can transact quickly
    key: `transactions-${address}-page-${page}-pageSize-${pageSize}-types-${selectedTypes.join(",")}`,
    getFreshValue: async () => {
      if (selectedTypes.length === 0) {
        return { transactions: [], transfers: [], hasNextPage: false };
      }

      const data = await queryTransactions({
        address,
        page,
        pageSize,
        messageTypes: selectedTypes.flatMap(
          (type) => MESSAGE_TYPES_BY_TRANSACTION_TYPE[type]
        ),
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

      const parsed = mapTransfers({
        transactions: data ?? [],
        address,
        assetLists,
        chainList,
      });
      const settled = await settleIbcWithdrawalsFromIndex({
        transfers: parsed,
        transactions: data ?? [],
        address,
      });
      const transfers = await resolveAxelarTransfers(settled, {
        env: IS_TESTNET ? "testnet" : "mainnet",
      });

      return {
        // a tx can hold messages of several types (e.g. a swap and a
        // transfer); return only the selected types
        transactions: selectedTypes.includes("swap")
          ? mappedSwapTransactions
          : [],
        transfers: transfers.filter((transfer) =>
          selectedTypes.includes(transfer.direction)
        ),
        hasNextPage,
      };
    },
  });
}

/** Pages of the user's ack/timeout txs to look through for pending sends. */
const MAX_IBC_OUTCOME_PAGES = 3;

/**
 * Settle pending IBC withdrawals from the relayer's acknowledgement /
 * timeout txs in the index (see `settleIbcWithdrawals`). Fetches more pages
 * only while sends remain unmatched and older than the oldest fetched outcome.
 * Best effort: on failure the transfers are returned as is.
 */
async function settleIbcWithdrawalsFromIndex({
  transfers,
  transactions,
  address,
}: {
  transfers: FormattedTransfer[];
  transactions: Transaction[];
  address: string;
}): Promise<FormattedTransfer[]> {
  const isPendingIbc = (t: FormattedTransfer) =>
    t.direction === "withdraw" &&
    t.status === "pending" &&
    t.toChain.chainType === "cosmos";
  if (!transfers.some(isPendingIbc)) return transfers;

  const pageSize = 100;
  let outcomes: Transaction[] = [];
  let settled = transfers;
  try {
    for (let page = 0; page < MAX_IBC_OUTCOME_PAGES; page++) {
      const batch = await queryTransactions({
        address,
        page: String(page),
        pageSize: String(pageSize),
        messageTypes: IBC_OUTCOME_MESSAGE_TYPES,
      });
      outcomes = outcomes.concat(batch ?? []);
      settled = settleIbcWithdrawals({
        transfers,
        transactions,
        outcomes,
        address,
      });

      // outcomes are newest first: older pages only help older sends
      const oldestOutcome = outcomes.at(-1)?.blockTimestamp;
      const unsettledOlder = settled.some(
        (t) =>
          isPendingIbc(t) &&
          oldestOutcome !== undefined &&
          t.createdAtUnix * 1000 < new Date(oldestOutcome).getTime()
      );
      if ((batch?.length ?? 0) < pageSize || !unsettledOlder) break;
    }
  } catch {
    // index error: leave the rest to client-side tracking
  }
  return settled;
}
