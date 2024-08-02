import { CoinPretty, Dec, Int, PricePretty } from "@keplr-wallet/unit";
import { DEFAULT_VS_CURRENCY, MappedLimitOrder } from "@osmosis-labs/server";
import { createColumnHelper } from "@tanstack/react-table";
import classNames from "classnames";
import dayjs from "dayjs";
import Image from "next/image";

import { Icon } from "~/components/assets";
import { ActionsCell } from "~/components/complex/orders-history/cells/actions";
import { OrderProgressBar } from "~/components/complex/orders-history/cells/filled-progress";
import { t } from "~/hooks";
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
      return (
        <small className="body2">
          {t("limitOrders.historyTable.columns.order")}
        </small>
      );
    },
    cell: ({
      row: {
        original: { order_direction },
      },
    }) => {
      return (
        <small className="subtitle1">
          {order_direction === "bid"
            ? t("limitOrders.buy")
            : t("limitOrders.sell")}
        </small>
      );
    },
  }),
  columnHelper.display({
    id: "amount",
    size: 400,
    header: () => (
      <small className="body2">
        {t("limitOrders.historyTable.columns.amount")}
      </small>
    ),
    cell: ({
      row: {
        original: {
          order_direction,
          quoteAsset,
          baseAsset,
          placed_quantity,
          output,
        },
      },
    }) => {
      const baseAssetLogo =
        baseAsset?.rawAsset.logoURIs.svg ??
        baseAsset?.rawAsset.logoURIs.png ??
        "";
      return (
        <div className="flex items-center gap-4">
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
              <span>
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
                {t("limitOrders.of")}
              </span>
              <Image
                src={baseAssetLogo}
                alt={`${baseAsset?.symbol} icon`}
                width={20}
                height={20}
                className="h-5 w-5"
              />
              <span>{baseAsset?.symbol}</span>
            </div>
          </div>
        </div>
      );
    },
  }),
  columnHelper.display({
    id: "price",
    header: () => {
      return (
        <small className="body2">
          {t("limitOrders.historyTable.columns.price")}
        </small>
      );
    },
    cell: ({
      row: {
        original: { baseAsset, price },
      },
    }) => {
      return (
        <div className="flex flex-col gap-1">
          <p className="body2 text-osmoverse-300">
            {baseAsset?.symbol} · {t("limitOrders.limit")}
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
      return (
        <small className="body2">
          {t("limitOrders.historyTable.columns.orderPlaced")}
        </small>
      );
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
      return (
        <small className="body2">
          {t("limitOrders.historyTable.columns.status")}
        </small>
      );
    },
    cell: ({ row: { original: order } }) => {
      const { status, placed_at } = order;
      const statusString = (() => {
        switch (status) {
          case "open":
          case "partiallyFilled":
            return t("limitOrders.open");
          case "filled":
          case "fullyClaimed":
            return t("limitOrders.filled");
          case "cancelled":
            return t("limitOrders.cancelled");
        }
      })();

      const statusComponent = (() => {
        switch (status) {
          case "open":
          case "partiallyFilled":
            return <OrderProgressBar order={order} />;
          case "cancelled":
            const dayDiff = dayjs(new Date()).diff(dayjs(placed_at), "d");
            const hourDiff = dayjs(new Date()).diff(dayjs(placed_at), "h");

            return (
              <span className="body2 text-osmoverse-300">
                {dayDiff > 0
                  ? t("limitOrders.daysAgo", {
                      days: dayDiff.toString(),
                    })
                  : hourDiff > 0
                  ? t("limitOrders.hoursAgo", {
                      hours: hourDiff.toString(),
                    })
                  : "<1 hour ago"}
              </span>
            );
          default:
            return;
        }
      })();

      return (
        <div className="flex flex-col gap-1">
          {statusComponent}
          <span
            className={classNames({
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
