import { CoinPretty, Dec, Int, PricePretty } from "@keplr-wallet/unit";
import { DEFAULT_VS_CURRENCY, MappedLimitOrder } from "@osmosis-labs/server";
import { createColumnHelper } from "@tanstack/react-table";
import classNames from "classnames";
import dayjs from "dayjs";
import Image from "next/image";

import { Icon } from "~/components/assets";
import { ActionsCell } from "~/components/complex/orders-history/cells/actions";
import { OrderProgressBar } from "~/components/complex/orders-history/cells/filled-progress";
import { formatPretty, getPriceExtendedFormatOptions } from "~/utils/formatter";

export type OrderCellData = MappedLimitOrder & {
  isRefetching: boolean;
  refetch: () => Promise<any>;
};

const columnHelper = createColumnHelper<OrderCellData>();

export const tableColumns = [
  columnHelper.display({
    id: "order",
    header: () => {
      return <small className="body2">Order</small>;
    },
    size: 400,
    cell: ({
      row: {
        original: {
          order_direction,
          quoteAsset,
          baseAsset,
          placed_quantity,
          output,
          // quantity,
          // tick_id,
          // percentFilled,
          // if 100 -> order filled
          // an order is claimable when percent filled is gt percent claimed
        },
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
              <span>
                {formatPretty(
                  new CoinPretty(
                    {
                      coinDecimals: baseAsset?.decimals ?? 0,
                      coinDenom: baseAsset?.symbol ?? "",
                      coinMinimalDenom: baseAsset?.coinMinimalDenom ?? "",
                    },
                    order_direction === "ask" ? placed_quantity : output
                  )
                )}
              </span>
              <Icon
                id="arrow-right"
                className="h-4 w-4"
                width={16}
                height={16}
              />
              <span>
                {formatPretty(
                  new CoinPretty(
                    {
                      coinDecimals: quoteAsset?.decimals ?? 0,
                      coinDenom: quoteAsset?.symbol ?? "",
                      coinMinimalDenom: quoteAsset?.coinMinimalDenom ?? "",
                    },
                    order_direction === "ask" ? output : placed_quantity
                  )
                )}
              </span>
            </p>
            <div className="inline-flex items-center gap-2">
              <span className="subtitle1 font-bold">
                {order_direction === "bid" ? "Buy" : "Sell"}{" "}
                {formatPretty(
                  new PricePretty(
                    DEFAULT_VS_CURRENCY,
                    order_direction === "bid"
                      ? placed_quantity /
                        Number(
                          new Dec(10)
                            .pow(new Int(quoteAsset?.decimals ?? 0))
                            .toString()
                        )
                      : output.quo(
                          new Dec(10).pow(new Int(quoteAsset?.decimals ?? 0))
                        )
                  )
                )}{" "}
                of
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
          <p>
            {formatPretty(new PricePretty(DEFAULT_VS_CURRENCY, price), {
              ...getPriceExtendedFormatOptions(price),
            })}
          </p>
        </div>
      );
    },
  }),
  columnHelper.display({
    id: "orderPlaced",
    header: () => {
      return <small className="body2">Order Placed</small>;
    },
    cell: ({
      row: {
        original: { placed_at },
      },
    }) => {
      const placedAt = dayjs(placed_at);
      const formattedTime = placedAt.format("h:mm A");
      const formattedDate = placedAt.format("MMM D");
      return (
        <div className="flex flex-col gap-1">
          <p className="body2 text-osmoverse-300">{formattedTime}</p>
          <p>{formattedDate}</p>
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
          <span
            className={classNames("caption", {
              "text-bullish-400":
                status === "filled" || status === "fullyClaimed",
              "text-osmoverse-300":
                status === "open" || status === "partiallyFilled",
              "text-osmoverse-500": status === "cancelled",
            })}
          >
            {statusString}
          </span>
        </div>
      );
    },
  }),
  columnHelper.display({
    id: "actions",
    cell: ActionsCell,
  }),
];
