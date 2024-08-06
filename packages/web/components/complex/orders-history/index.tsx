import { CoinPretty, Dec, Int, PricePretty } from "@keplr-wallet/unit";
import { DEFAULT_VS_CURRENCY, MappedLimitOrder } from "@osmosis-labs/server";
import { useWindowVirtualizer } from "@tanstack/react-virtual";
import classNames from "classnames";
import dayjs from "dayjs";
import { observer } from "mobx-react-lite";
import Image from "next/image";
import Link from "next/link";
import React, {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { Icon } from "~/components/assets";
import { ActionsCell } from "~/components/complex/orders-history/cells/actions";
import { OrderProgressBar } from "~/components/complex/orders-history/cells/filled-progress";
import { Spinner } from "~/components/loaders";
import { GenericDisclaimer } from "~/components/tooltip/generic-disclaimer";
import { EventName } from "~/config";
import { useAmplitudeAnalytics, useTranslation } from "~/hooks";
import {
  useOrderbookAllActiveOrders,
  useOrderbookClaimableOrders,
} from "~/hooks/limit-orders/use-orderbook";
import { useStore } from "~/stores";
import {
  formatFiatPrice,
  formatPretty,
  getPriceExtendedFormatOptions,
} from "~/utils/formatter";

function groupOrdersByStatus(orders: MappedLimitOrder[]) {
  const filledOrders = orders.filter((o) => o.status === "filled");
  const pendingOrders = orders.filter(
    (o) => o.status === "partiallyFilled" || o.status === "open"
  );
  const pastOrders = orders.filter(
    (o) => o.status === "cancelled" || o.status === "fullyClaimed"
  );

  return {
    filled: filledOrders,
    pending: pendingOrders,
    past: pastOrders,
  };
}

const headers = ["order", "amount", "price", "orderPlaced", "status"];

export const OrderHistory = observer(() => {
  const { logEvent } = useAmplitudeAnalytics({
    onLoadEvent: [EventName.LimitOrder.pageViewed],
  });
  const { accountStore } = useStore();
  const { t } = useTranslation();
  const wallet = accountStore.getWallet(accountStore.osmosisChainId);
  const listRef = useRef<HTMLTableElement>(null);

  const {
    orders,
    isLoading,
    fetchNextPage,
    isFetchingNextPage,
    hasNextPage,
    refetch,
  } = useOrderbookAllActiveOrders({
    userAddress: wallet?.address ?? "",
    pageSize: 10,
  });

  const groupedOrders = useMemo(() => groupOrdersByStatus(orders), [orders]);
  const groups = useMemo(
    () =>
      Object.keys(groupedOrders).filter(
        (group) => groupedOrders[group as keyof typeof groupedOrders].length > 0
      ),
    [groupedOrders]
  );
  const rows = useMemo(
    () =>
      groups.reduce<Array<string | MappedLimitOrder>>(
        (acc, group) => [
          ...acc,
          group,
          ...groupedOrders[group as keyof typeof groupedOrders],
        ],
        []
      ),
    [groups, groupedOrders]
  );

  const rowVirtualizer = useWindowVirtualizer({
    count: hasNextPage ? rows.length + 1 : rows.length,
    estimateSize: () => 84,
    paddingStart: -220,
    overscan: 10,
    scrollMargin: listRef.current?.offsetTop ?? 0,
  });

  useEffect(() => {
    const [lastItem] = [...rowVirtualizer.getVirtualItems()].reverse();
    if (!lastItem) return;

    if (
      lastItem.index >= orders.length - 1 &&
      hasNextPage &&
      !isFetchingNextPage
    ) {
      fetchNextPage();
    }
  }, [
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    rowVirtualizer,
    orders.length,
  ]);

  const { claimAllOrders, count: filledOrdersCount } =
    useOrderbookClaimableOrders({
      userAddress: wallet?.address ?? "",
    });

  const claimOrders = useCallback(async () => {
    try {
      logEvent([EventName.LimitOrder.claimOrdersStarted]);
      await claimAllOrders();
      await refetch();
      logEvent([EventName.LimitOrder.claimOrdersCompleted]);
    } catch (error) {
      if (error instanceof Error && error.message === "Request rejected") {
        // don't log when the user rejects in wallet
        return;
      }
      const { message } = error as Error;
      logEvent([
        EventName.LimitOrder.claimOrdersFailed,
        { errorMessage: message },
      ]);
    }
  }, [claimAllOrders, logEvent, refetch]);

  if (orders.length === 0 && !isLoading) {
    return (
      <div className="flex flex-col items-center justify-center gap-6">
        <Image
          src="/images/ion-thumbs-up.svg"
          alt="ion thumbs up"
          width={120}
          height={80}
        />
        <h6>{t("limitOrders.historyTable.emptyState.title")}</h6>
        <p className="body2 inline-flex items-center gap-1 text-osmoverse-300">
          {t("limitOrders.historyTable.emptyState.subtitle")}
          <Link href={"/"} className="text-wosmongton-300">
            {t("limitOrders.startTrading")}
          </Link>
        </p>
      </div>
    );
  }

  return (
    <div className="mt-3 flex flex-col">
      <table className="relative table-auto" ref={listRef}>
        {!isLoading && (
          <thead className="border-b border-osmoverse-700 bg-osmoverse-1000">
            <tr className="grid grid-cols-[1fr_3fr_1fr_1fr_1fr_1fr]">
              {headers.map((header) => (
                <th key={header} className="!px-0">
                  <small className="body2">
                    {t(`limitOrders.historyTable.columns.${header}`)}
                  </small>
                </th>
              ))}
            </tr>
          </thead>
        )}
        <tbody
          className="bg-transparent"
          style={{ height: `${rowVirtualizer.getTotalSize()}px` }}
        >
          {isLoading ? (
            <div className="flex items-center justify-center py-10">
              <Spinner className="!h-10 !w-10" />
            </div>
          ) : (
            rowVirtualizer.getVirtualItems().map((virtualRow) => {
              const row = rows[virtualRow.index];

              if (!row) return;

              const style = {
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: `${virtualRow.size}px`,
                transform: `translateY(${virtualRow.start}px)`,
              };

              if (typeof row === "string") {
                return (
                  <TableGroupHeader
                    key={virtualRow.index}
                    group={row}
                    style={style}
                    filledOrdersCount={filledOrdersCount}
                    claimOrders={claimOrders}
                  />
                );
              }

              const order = row as MappedLimitOrder;
              return (
                <TableOrderRow
                  key={virtualRow.index}
                  order={order}
                  style={style}
                  refetch={async () => refetch()}
                />
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
});

const TableGroupHeader = ({
  group,
  style,
  filledOrdersCount,
  claimOrders,
}: {
  group: string;
  style: Object;
  filledOrdersCount: number;
  claimOrders: () => Promise<void>;
}) => {
  const { t } = useTranslation();
  const [claiming, setClaiming] = useState(false);

  const claim = useCallback(async () => {
    setClaiming(true);
    await claimOrders();
    setClaiming(false);
  }, [claimOrders]);

  if (group === "filled") {
    return (
      <tr className="h-[84px]">
        <td colSpan={5} className="!p-0">
          <div className="flex w-full items-end justify-between pr-4">
            <div className="relative flex items-end gap-3 pt-5">
              <div className="flex items-center gap-2 pb-3">
                <h6>{t("limitOrders.filledOrdersToClaim")}</h6>
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#A51399]">
                  <span className="caption">{filledOrdersCount}</span>
                </div>
              </div>
              <GenericDisclaimer
                title={t("limitOrders.whatIsOrderClaim.title")}
                body={t("limitOrders.whatIsOrderClaim.description")}
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-full transition-colors hover:bg-osmoverse-800">
                  <Icon
                    id="question"
                    className="h-6 w-6 text-wosmongton-200"
                    width={24}
                    height={24}
                  />
                </div>
              </GenericDisclaimer>
            </div>
            <button
              className="flex items-center justify-center rounded-[48px] bg-wosmongton-700 py-3 px-4 disabled:opacity-50"
              onClick={claim}
              disabled={claiming}
            >
              {claiming && <Spinner className="mr-2 !h-2 !w-2" />}
              <span className="subtitle1">{t("limitOrders.claimAll")}</span>
            </button>
          </div>
        </td>
      </tr>
    );
  }
  return (
    <tr style={style}>
      <h6 className="pb-4 pt-8">{t(`limitOrders.${group}`)}</h6>{" "}
    </tr>
  );
};

const TableOrderRow = memo(
  ({
    order,
    style,
    refetch,
  }: {
    order: MappedLimitOrder;
    style: Object;
    refetch: () => Promise<any>;
  }) => {
    const { t } = useTranslation();

    const {
      order_direction,
      quoteAsset,
      baseAsset,
      placed_quantity,
      output,
      price,
      placed_at,
      status,
    } = order;

    const baseAssetLogo =
      baseAsset?.rawAsset.logoURIs.svg ??
      baseAsset?.rawAsset.logoURIs.png ??
      "";

    const placedAt = dayjs(placed_at);
    const formattedTime = placedAt.format("h:mm A");
    const formattedDate = placedAt.format("MMM D");

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
      <tr style={style} className="grid grid-cols-[1fr_3fr_1fr_1fr_1fr_1fr]">
        <td className="flex items-center !px-0 !text-left">
          <div className="flex h-[40px] w-[40px] items-center justify-center rounded-full bg-osmoverse-alpha-850 p-2">
            <Icon
              id={order_direction === "bid" ? "plus" : "minus"}
              className={classNames("h-4 w-4", {
                "text-rust-400": order_direction === "ask",
                "text-bullish-400": order_direction === "bid",
              })}
              width={22}
              height={22}
            />
          </div>
        </td>
        <td className="!px-0 !text-left">
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
                  {formatFiatPrice(
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
                    ),
                    2
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
        </td>
        <td className="!px-0 !text-left">
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
        </td>
        <td className="!px-0 !text-left">
          <div className="flex flex-col gap-1">
            <p className="body2 text-osmoverse-300">{formattedTime}</p>
            <p>{formattedDate}</p>
          </div>
        </td>
        <td className="!px-0 !text-left">
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
        </td>
        <td className="flex items-center justify-end !px-0 !text-left">
          <ActionsCell order={order} refetch={refetch} />
        </td>
      </tr>
    );
  }
);
