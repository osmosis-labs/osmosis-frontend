import { Dec, Int } from "@keplr-wallet/unit";
import { tickToPrice } from "@osmosis-labs/math";
import { AssetList, Chain } from "@osmosis-labs/types";
import { getAssetFromAssetList } from "@osmosis-labs/utils";
import cachified, { CacheEntry } from "cachified";
import dayjs from "dayjs";
import { LRUCache } from "lru-cache";

import { DEFAULT_LRU_OPTIONS } from "../../../utils/cache";
import { LimitOrder, queryOrderbookActiveOrders } from "../../osmosis";
import { getOrderbookDenoms } from "./denoms";
import {
  getOrderbookTickState,
  getOrderbookTickUnrealizedCancels,
} from "./tick-state";
import type { MappedLimitOrder, OrderStatus } from "./types";

const activeOrdersCache = new LRUCache<string, CacheEntry>(DEFAULT_LRU_OPTIONS);

export function getOrderbookActiveOrders({
  orderbookAddress,
  userOsmoAddress,
  chainList,
  assetLists,
}: {
  orderbookAddress: string;
  userOsmoAddress: string;
  chainList: Chain[];
  assetLists: AssetList[];
}) {
  return cachified({
    cache: activeOrdersCache,
    key: `orderbookActiveOrders-${orderbookAddress}-${userOsmoAddress}`,
    ttl: 1000, // 2 seconds
    getFreshValue: () =>
      queryOrderbookActiveOrders({
        orderbookAddress,
        userAddress: userOsmoAddress,
        chainList,
      }).then(
        async ({ data }: { data: { count: number; orders: LimitOrder[] } }) => {
          const { quoteAsset, baseAsset } = await getOrderbookDenoms({
            orderbookAddress,
            chainList,
            assetLists,
          });

          return getTickInfoAndTransformOrders(
            orderbookAddress,
            data.orders,
            chainList,
            quoteAsset,
            baseAsset
          );
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
  const tickIds = [...new Set(orders.map((o) => o.tick_id))];
  const tickStates = await getOrderbookTickState({
    orderbookAddress,
    chainList,
    tickIds,
  });
  const unrealizedTickCancels = await getOrderbookTickUnrealizedCancels({
    orderbookAddress,
    chainList,
    tickIds,
  });

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
