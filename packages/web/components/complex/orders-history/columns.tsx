import { createColumnHelper } from "@tanstack/react-table";
import classNames from "classnames";

import { Icon } from "~/components/assets";
import { Order } from "~/components/complex/orders-history";

const columnHelper = createColumnHelper<Order>();

export const tableColumns = [
  columnHelper.display({
    id: "order",
    header: () => {
      return <small className="body2">Order</small>;
    },
    cell: ({
      row: {
        original: {
          order_direction,
          baseDenom,
          quoteDenom,
          // placed_quantity,
          // quantity,
          // tick_id,
          // percentFilled,
          // if 100 -> order filled
          // an order is claimable when percent filled is gt percent claimed
        },
      },
    }) => {
      return (
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-osmoverse-800">
            <Icon
              id="exchange"
              className={classNames("h-6 w-6 text-bullish-400")}
              width={24}
              height={24}
            />
          </div>
          <div className="flex flex-col gap-1">
            <p
              className={classNames(
                "body2 inline-flex items-center gap-1 text-osmoverse-300",
                { "flex-row-reverse": order_direction === "bid" }
              )}
            >
              <span>1000 {baseDenom}</span>
              <Icon
                id="arrow-right"
                className="h-4 w-4"
                width={16}
                height={16}
              />
              <span>
                0.123
                {quoteDenom}
              </span>
            </p>
          </div>
        </div>
      );
    },
  }),
  columnHelper.display({
    id: "price",
    header: () => {
      return <small className="body2">Price</small>;
    },
  }),
  columnHelper.display({
    id: "orderPlaced",
    header: () => {
      return <small className="body2">Order Placed</small>;
    },
  }),
  columnHelper.display({
    id: "status",
    header: () => {
      return <small className="body2">Status</small>;
    },
  }),
  columnHelper.display({
    id: "status",
  }),
];
