import { Dec, Int } from "@keplr-wallet/unit";
import { tickToPrice } from "@osmosis-labs/math";
import { AssetList, Chain } from "@osmosis-labs/types";
import { getAssetFromAssetList } from "@osmosis-labs/utils";
import cachified, { CacheEntry } from "cachified";
import dayjs from "dayjs";
import { LRUCache } from "lru-cache";

import { DEFAULT_LRU_OPTIONS } from "../../../utils/cache";
import { LimitOrder, queryOrderbookActiveOrders } from "../../osmosis";
import { queryActiveOrdersSQS } from "../../sidecar/orderbooks";
import {
  getOrderbookTickState,
  getOrderbookTickUnrealizedCancels,
} from "./tick-state";
import type { MappedLimitOrder, OrderStatus } from "./types";

const activeOrdersCache = new LRUCache<string, CacheEntry>(DEFAULT_LRU_OPTIONS);

export function getOrderbookActiveOrdersSQS({
  userOsmoAddress,
  assetList,
}: {
  userOsmoAddress: string;
  assetList: AssetList[];
}) {
  return cachified({
    cache: activeOrdersCache,
    key: `orderbookActiveOrders-sqs-${userOsmoAddress}`,
    ttl: 5000, // 5 seconds
    getFreshValue: () =>
      queryActiveOrdersSQS({
        userOsmoAddress,
      }).then(async ({ orders }) => {
        const mappedOrders: MappedLimitOrder[] = orders.map((o) => {
          return {
            ...o,
            price: new Dec(o.price),
            quantity: parseInt(o.quantity),
            placed_quantity: parseInt(o.placed_quantity),
            percentClaimed: new Dec(o.percentClaimed),
            totalFilled: parseInt(o.totalFilled),
            percentFilled: new Dec(o.percentFilled),
            quoteAsset: getAssetFromAssetList({
              coinMinimalDenom: o.quote_asset.symbol,
              assetLists: assetList,
            }),
            baseAsset: getAssetFromAssetList({
              coinMinimalDenom: o.base_asset.symbol,
              assetLists: assetList,
            }),
            output: new Dec(o.output),
          };
        });
        return mappedOrders;
      }),
  });
}

export function getOrderbookActiveOrders({
  orderbookAddress,
  userOsmoAddress,
  chainList,
  baseAsset,
  quoteAsset,
}: {
  orderbookAddress: string;
  userOsmoAddress: string;
  chainList: Chain[];
  baseAsset: ReturnType<typeof getAssetFromAssetList>;
  quoteAsset: ReturnType<typeof getAssetFromAssetList>;
}) {
  return cachified({
    cache: activeOrdersCache,
    key: `orderbookActiveOrders-${orderbookAddress}-${userOsmoAddress}`,
    ttl: 10000, // 10 seconds
    getFreshValue: () =>
      queryOrderbookActiveOrders({
        orderbookAddress,
        userAddress: userOsmoAddress,
        chainList,
      }).then(
        async ({ data }: { data: { count: number; orders: LimitOrder[] } }) => {
          const resp = await getTickInfoAndTransformOrders(
            orderbookAddress,
            data.orders,
            chainList,
            quoteAsset,
            baseAsset
          );
          return resp;
        }
      ),
  });
}

function mapOrderStatus(order: LimitOrder, percentFilled: Dec): OrderStatus {
  const quantInt = parseInt(order.quantity);
  if (quantInt === 0 || percentFilled.equals(new Dec(1))) return "filled";
  if (percentFilled.isZero()) return "open";
  if (percentFilled.lt(new Dec(1))) return "partiallyFilled";

  return "open";
}

async function getTickInfoAndTransformOrders(
  orderbookAddress: string,
  orders: LimitOrder[],
  chainList: Chain[],
  quoteAsset: ReturnType<typeof getAssetFromAssetList>,
  baseAsset: ReturnType<typeof getAssetFromAssetList>
): Promise<MappedLimitOrder[]> {
  if (orders.length === 0) return [];

  const tickIds = [...new Set(orders.map((o) => o.tick_id))];

  const [tickStates, unrealizedTickCancels] = await Promise.all([
    getOrderbookTickState({
      orderbookAddress,
      chainList,
      tickIds,
    }),
    getOrderbookTickUnrealizedCancels({
      orderbookAddress,
      chainList,
      tickIds,
    }),
  ]);

  const fullTickState = tickStates.map(({ tick_id, tick_state }) => ({
    tickId: tick_id,
    tickState: tick_state,
    unrealizedCancels: unrealizedTickCancels.find((c) => c.tick_id === tick_id),
  }));

  return orders.map((o) => {
    const { tickState, unrealizedCancels } = fullTickState.find(
      ({ tickId }) => tickId === o.tick_id
    ) ?? { tickState: undefined, unrealizedCancels: undefined };

    const quantity = parseInt(o.quantity);
    const placedQuantity = parseInt(o.placed_quantity);

    const percentClaimed = new Dec(
      (placedQuantity - quantity) / placedQuantity
    );

    const normalizationFactor = new Dec(10).pow(
      new Int((quoteAsset?.decimals ?? 0) - (baseAsset?.decimals ?? 0))
    );
    const [tickEtas, tickUnrealizedCancelled] =
      o.order_direction === "bid"
        ? [
            parseInt(
              tickState?.bid_values.effective_total_amount_swapped ?? "0"
            ),
            parseInt(
              unrealizedCancels?.unrealized_cancels.bid_unrealized_cancels ??
                "0"
            ),
          ]
        : [
            parseInt(
              tickState?.ask_values.effective_total_amount_swapped ?? "0"
            ),
            parseInt(
              unrealizedCancels?.unrealized_cancels.ask_unrealized_cancels ??
                "0"
            ),
          ];
    const tickTotalEtas = tickEtas + tickUnrealizedCancelled;
    const totalFilled = Math.max(
      tickTotalEtas - (parseInt(o.etas) - (placedQuantity - quantity)),
      0
    );
    const percentFilled = new Dec(Math.min(totalFilled / placedQuantity, 1));
    const price = tickToPrice(new Int(o.tick_id));
    const status = mapOrderStatus(o, percentFilled);
    const output =
      o.order_direction === "bid"
        ? new Dec(placedQuantity).quo(price)
        : new Dec(placedQuantity).mul(price);
    return {
      ...o,
      price: price.quo(normalizationFactor),
      quantity,
      placed_quantity: placedQuantity,
      percentClaimed,
      totalFilled,
      percentFilled,
      orderbookAddress,
      status,
      output,
      quoteAsset,
      baseAsset,
      placed_at: dayjs(parseInt(o.placed_at) / 1_000).unix(),
    };
  });
}
