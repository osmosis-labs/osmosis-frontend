import { getAssetFromAssetList } from "@osmosis-labs/utils";
import { useMemo } from "react";

import { Order } from "~/components/complex/orders-history";
import { AssetLists } from "~/config/generated/asset-lists";

export function useAggregatedOrders({ orders }: { orders: Order[] }) {
  const aggregated: Order[] = useMemo(
    () =>
      orders.map((order) => {
        return {
          ...order,
          baseDenom:
            getAssetFromAssetList({
              assetLists: AssetLists,
              coinMinimalDenom: order.baseDenom,
            })?.symbol ?? order.baseDenom,
          quoteDenom:
            getAssetFromAssetList({
              assetLists: AssetLists,
              coinMinimalDenom: order.quoteDenom,
            })?.symbol ?? order.quoteDenom,
        };
      }),
    [orders]
  );

  return {
    orders: aggregated,
  };
}
