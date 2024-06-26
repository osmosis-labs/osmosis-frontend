import { PricePretty } from "@keplr-wallet/unit";
import { DEFAULT_VS_CURRENCY } from "@osmosis-labs/server";
import { createColumnHelper } from "@tanstack/react-table";
import classNames from "classnames";
import Image from "next/image";

import { Icon } from "~/components/assets";
import { ActionsCell } from "~/components/complex/orders-history/cells/actions";
import { OrderProgressBar } from "~/components/complex/orders-history/cells/filled-progress";
import { DisplayableLimitOrder } from "~/hooks/limit-orders/use-orderbook";
import { formatPretty } from "~/utils/formatter";

const columnHelper = createColumnHelper<DisplayableLimitOrder>();

export const tableColumns = [
  columnHelper.display({
    id: "order",
    header: () => {
      return <small className="body2">Order</small>;
    },
    size: 400,
    cell: ({
      row: {
        original: { order_direction, quoteAsset, baseAsset },
      },
    }) => {
      const baseAssetLogo =
        baseAsset?.rawAsset.logoURIs.svg ??
        baseAsset?.rawAsset.logoURIs.png ??
        "";

      return (
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-osmoverse-800">
            <Icon
              id="exchange"
              className={classNames("h-6 w-6", {
                "text-bullish-400": order_direction === "bid",
                "text-rust-400": order_direction === "ask",
              })}
              width={24}
              height={24}
            />
          </div>
          <div className="flex flex-col gap-1">
            <p
              className={classNames(
                "body2 inline-flex w-fit items-center gap-1 text-osmoverse-300",
                { "flex-row-reverse": order_direction === "bid" }
              )}
            >
              <span>1000 {baseAsset?.symbol}</span>
              <Icon
                id="arrow-right"
                className="h-4 w-4"
                width={16}
                height={16}
              />
              <span>0.123 {quoteAsset?.symbol}</span>
            </p>
            <div className="inline-flex items-center gap-2">
              <span className="subtitle1 font-bold">
                {order_direction === "bid" ? "Buy" : "Sell"} $1000 of
              </span>
              <Image
                src={baseAssetLogo}
                alt={`${baseAsset?.symbol} icon`}
                width={20}
                height={20}
                className="h-5 w-5"
              />
              <span className="subtitle1">{baseAsset?.symbol}</span>
            </div>
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
    cell: ({
      row: {
        original: { baseAsset, price },
      },
    }) => {
      return (
        <div className="flex flex-col gap-1">
          <p className="body2 text-osmoverse-300">
            {baseAsset?.symbol} · Limit
          </p>
          <p>{formatPretty(new PricePretty(DEFAULT_VS_CURRENCY, price))}</p>
        </div>
      );
    },
  }),
  columnHelper.display({
    id: "orderPlaced",
    header: () => {
      return <small className="body2">Order Placed</small>;
    },
    cell: () => {
      return (
        <div className="flex flex-col gap-1">
          <p className="body2 text-osmoverse-300">2:14 PM</p>
          <p>Apr 1st</p>
        </div>
      );
    },
  }),
  columnHelper.display({
    id: "status",
    header: () => {
      return <small className="body2">Status</small>;
    },
    cell: ({ row: { original: order } }) => {
      const { status } = order;
      const statusString = (() => {
        switch (status) {
          case "open":
          case "partiallyFilled":
            return "Open";
          case "filled":
          case "fullyClaimed":
            return "Filled";
          case "cancelled":
            return "Cancelled";
        }
      })();

      const statusComponent = (() => {
        switch (status) {
          case "open":
          case "partiallyFilled":
            return <OrderProgressBar order={order} />;
          default:
            return;
        }
      })();

      return (
        <div className="flex flex-col gap-1">
          {statusComponent}
          <p
            className={classNames({
              "text-bullish-400":
                status === "filled" || status === "fullyClaimed",
              "text-wosmongton-300":
                status === "open" || status === "partiallyFilled",
              "text-rust-400": status === "cancelled",
            })}
          >
            {statusString}
          </p>
        </div>
      );
    },
    // cell: MOCK_PercentOpenStatus,
    // cell: MOCK_FailedStatus,
    // cell: MOCK_CancelledStatus,
  }),
  columnHelper.display({
    id: "actions",
    cell: ActionsCell,
  }),
];

// function MOCK_PercentOpenStatus() {
//   // For testing purposes change this value
//   const percentFilled = 0.5;

//   return (
//     <div className="flex flex-col gap-1">
//       <div className="flex h-5 items-center gap-2">
//         <div className="relative h-2 w-16 overflow-hidden rounded-full bg-osmoverse-700">
//           <div
//             className="absolute left-0 h-2 bg-bullish-400"
//             style={{ width: `${64 * percentFilled}px` }}
//           />
//         </div>
//         <small className="caption text-bullish-400">
//           {percentFilled * 100}%
//         </small>
//       </div>
//       <p className="text-wosmongton-300">Open</p>
//     </div>
//   );
// }

// function MOCK_FailedStatus() {
//   return (
//     <div className="flex flex-col gap-1">
//       <p className="body2 text-osmoverse-300">82d ago</p>
//       <p className="text-rust-400">Expired</p>
//     </div>
//   );
// }

// function MOCK_CancelledStatus() {
//   return (
//     <div className="flex flex-col gap-1">
//       <p className="body2 text-osmoverse-300">82d ago</p>
//       <p className="text-osmoverse-300">Cancelled</p>
//     </div>
//   );
// }
