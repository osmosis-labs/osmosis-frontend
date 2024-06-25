import { getAssetFromAssetList } from "@osmosis-labs/utils";
import { useMemo } from "react";

import { Order } from "~/components/complex/orders-history";
import { AssetLists } from "~/config/generated/asset-lists";

export type AggregatedOrder = Order & {
  baseAsset: ReturnType<typeof getAssetFromAssetList>;
  quoteAsset: ReturnType<typeof getAssetFromAssetList>;
};

export function useAggregatedOrders({
  orders,
}: {
  orders: Order[];
}): AggregatedOrder[] {
  const aggregated: AggregatedOrder[] = useMemo(
    () =>
      orders.map((order) => {
        return {
          ...order,
          baseAsset: getAssetFromAssetList({
            assetLists: AssetLists,
            coinMinimalDenom: order.baseDenom,
          }),
          quoteAsset: getAssetFromAssetList({
            assetLists: AssetLists,
            coinMinimalDenom: order.quoteDenom,
          }),
        };
      }),
    [orders]
  );

  return aggregated;
}
