import { CoinPretty, Dec, Int, PricePretty } from "@keplr-wallet/unit";
import { DEFAULT_VS_CURRENCY, MappedLimitOrder } from "@osmosis-labs/server";
import { useWindowVirtualizer } from "@tanstack/react-virtual";
import classNames from "classnames";
import dayjs from "dayjs";
import { observer } from "mobx-react-lite";
import Image from "next/image";
import Link from "next/link";
import React, { memo, useCallback, useMemo, useRef, useState } from "react";

import { Icon } from "~/components/assets";
import { ActionsCell } from "~/components/complex/orders-history/cells/actions";
import { OrderProgressBar } from "~/components/complex/orders-history/cells/filled-progress";
import { OrderModal } from "~/components/complex/orders-history/order-modal";
import { Intersection } from "~/components/intersection";
import { Spinner } from "~/components/loaders";
import { GenericDisclaimer } from "~/components/tooltip/generic-disclaimer";
import { Button } from "~/components/ui/button";
import { EventName } from "~/config";
import {
  Breakpoint,
  useAmplitudeAnalytics,
  useFeatureFlags,
  useTranslation,
  useWalletSelect,
  useWindowSize,
} from "~/hooks";
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
const mdHeaders = ["order", "status"];
const lgHeaders = ["order", "orderPlaced", "status"];

const gridClasses =
  "grid grid-cols-[80px_4fr_2fr_2fr_2fr_150px] md:grid-cols-[2fr_1fr] xl:grid-cols-[2fr_1fr_1fr]";

export const OrderHistory = observer(() => {
  const { logEvent } = useAmplitudeAnalytics({
    onLoadEvent: [EventName.LimitOrder.pageViewed],
  });
  const featureFlags = useFeatureFlags();
  const { accountStore } = useStore();
  const { t } = useTranslation();
  const wallet = accountStore.getWallet(accountStore.osmosisChainId);
  const listRef = useRef<HTMLTableElement>(null);
  const { onOpenWalletSelect, isLoading: isWalletLoading } = useWalletSelect();
  const { isMobile } = useWindowSize(Breakpoint.md);
  const { isMobile: isLargeScreen } = useWindowSize(Breakpoint.xl);
  const [selectedOrder, setSelectedOrder] = useState<MappedLimitOrder>();

  const {
    orders,
    isLoading,
    fetchNextPage,
    isFetchingNextPage,
    hasNextPage,
    refetch,
    isRefetching,
  } = useOrderbookAllActiveOrders({
    userAddress: wallet?.address ?? "",
    pageSize: 20,
    refetchInterval: featureFlags.sqsActiveOrders ? 10000 : 30000,
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
    count: rows.length,
    estimateSize: () => (isMobile ? 60 : 84),
    paddingEnd: 110,
    overscan: 10,
    scrollMargin: listRef.current?.offsetTop ?? 0,
    paddingStart: 45,
  });
  const filledOrdersInDisplay = useMemo(() => {
    return orders.filter((o) => o.status === "filled");
  }, [orders]);

  const { claimAllOrders, count: filledOrdersCount } =
    useOrderbookClaimableOrders({
      userAddress: wallet?.address ?? "",
      disabled: isLoading || filledOrdersInDisplay.length === 0 || isRefetching,
      refetchInterval: featureFlags.sqsActiveOrders ? 10000 : 30000,
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

  const showConnectWallet = !wallet?.isWalletConnected && !isWalletLoading;

  const onOrderSelect = useCallback(
    (order: MappedLimitOrder) => {
      if (!isLargeScreen) return;
      setSelectedOrder(order);
    },
    [isLargeScreen]
  );

  if (showConnectWallet) {
    return (
      <div className="mx-auto my-6 flex flex-col justify-center gap-6 px-4 text-center">
        <Image
          className="mx-auto"
          src="/images/ion-thumbs-up.svg"
          alt="ion thumbs up"
          width="260"
          height="160"
        />
        <div className="flex w-full flex-col items-center gap-2 text-center">
          <h6>{t("limitOrders.historyTable.emptyState.connectTitle")}</h6>
          <p className="body1 text-osmoverse-300">
            {t("limitOrders.historyTable.emptyState.connectSubtitle")}
          </p>
        </div>
        <div className="max-w-56">
          <Button
            onClick={() =>
              onOpenWalletSelect({
                walletOptions: [
                  {
                    walletType: "cosmos",
                    chainId: accountStore.osmosisChainId,
                  },
                ],
              })
            }
            size="md"
          >
            {t("transactions.connectWallet")}
          </Button>
        </div>
      </div>
    );
  }

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
    <div className="mt-3 flex flex-col overflow-x-scroll xl:overflow-visible">
      <table
        className="relative min-w-[900px] table-auto xl:min-w-[100%]"
        ref={listRef}
      >
        {!isLoading && (
          <thead className="border-b border-osmoverse-700 bg-osmoverse-1000">
            <tr className={classNames("bg-osmoverse-1000", gridClasses)}>
              {headers.map((header) => (
                <th
                  key={header}
                  className={classNames("flex !px-0", {
                    "md:hidden": !mdHeaders.includes(header),
                    "xl:hidden": !lgHeaders.includes(header),
                    "xl:justify-end": isLargeScreen && header === "status",
                  })}
                >
                  {header !== "amount" && (
                    <small className="body2 sm:caption">
                      {t(`limitOrders.historyTable.columns.${header}`)}
                    </small>
                  )}
                </th>
              ))}
              {!isLargeScreen && <th />}
            </tr>
          </thead>
        )}
        <tbody
          className="bg-transparent xl:overflow-visible"
          style={{ height: `${rowVirtualizer.getTotalSize()}px` }}
        >
          {isLoading ? (
            <tr className="flex items-center justify-center py-10">
              <Spinner className="!h-10 !w-10" />
            </tr>
          ) : (
            rowVirtualizer.getVirtualItems().map((virtualRow) => {
              const row = rows[virtualRow.index];

              const style = {
                position: "absolute",
                top: 0,
                left: "0",
                width: "100%",
                height: `${virtualRow.size}px`,
                transform: `translateY(${
                  virtualRow.start - rowVirtualizer.options.scrollMargin
                }px)`,
              };

              if (!row)
                return <tr key={`${virtualRow.index}`} style={style as any} />;

              if (typeof row === "string") {
                return (
                  <TableGroupHeader
                    key={`${virtualRow.index}`}
                    group={row}
                    style={style}
                    filledOrdersCount={filledOrdersCount}
                    claimOrders={claimOrders}
                  />
                );
              }

              const order = row as MappedLimitOrder;
              // style.left = isLargeScreen ? "rem" : "0";
              style.width = isLargeScreen ? "calc(100% + 2rem)" : "100%";
              return (
                <TableOrderRow
                  key={`${virtualRow.index}`}
                  order={order}
                  style={style}
                  refetch={refetch}
                  onOrderSelect={onOrderSelect}
                />
              );
            })
          )}
        </tbody>
        <Intersection
          onVisible={() => {
            if (hasNextPage && !isFetchingNextPage && !isLoading) {
              fetchNextPage();
            }
          }}
        />
      </table>
      {isLargeScreen && (
        <OrderModal
          order={selectedOrder}
          onRequestClose={() => setSelectedOrder(undefined)}
        />
      )}
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
      <tr
        style={style}
        className={classNames(
          "grid grid-cols-[auto_180px] items-center md:grid-cols-[auto_100px]"
        )}
      >
        <td colSpan={5} className="!p-0">
          <div className="flex w-full items-center justify-between pr-4">
            <div className="relative flex items-center gap-3">
              <div className="flex items-center gap-2">
                <span className="sm:subtitle1 text-h5 font-h5">
                  {t("limitOrders.orderHistoryHeaders.filled")}
                </span>
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#A51399]">
                  <span className="md:body2 text-subtitle font-subtitle">
                    {filledOrdersCount}
                  </span>
                </div>
              </div>
              <GenericDisclaimer
                title={t("limitOrders.whatIsOrderClaim.title")}
                body={t("limitOrders.whatIsOrderClaim.description")}
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-full transition-colors hover:bg-osmoverse-800 md:hidden">
                  <Icon
                    id="question"
                    className="h-6 w-6 text-wosmongton-200"
                    width={24}
                    height={24}
                  />
                </div>
              </GenericDisclaimer>
            </div>
          </div>
        </td>
        <td className="flex items-center justify-end md:!p-0">
          <button
            className="md:scale-1/2 flex items-center justify-center rounded-[48px] bg-wosmongton-700 py-3 px-4 disabled:opacity-50"
            onClick={claim}
            disabled={claiming}
          >
            {claiming && <Spinner className="mr-2 !h-2 !w-2 md:hidden" />}
            <span className="subtitle1 md:text-caption">
              {t("limitOrders.claimAll")}
            </span>
          </button>
        </td>
      </tr>
    );
  }

  return (
    <tr style={style} className="flex items-center">
      <span className="sm:subtitle1 py-4 text-h5 font-h5 sm:pb-2 sm:pt-4">
        {group === "pending"
          ? t("limitOrders.orderHistoryHeaders.pending")
          : t("limitOrders.orderHistoryHeaders.past")}
      </span>
    </tr>
  );
};

const TableOrderRow = memo(
  ({
    order,
    style,
    refetch,
    onOrderSelect,
  }: {
    order: MappedLimitOrder;
    style: Object;
    refetch: () => Promise<any>;
    onOrderSelect: (order: MappedLimitOrder) => void;
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

    const placedAt = dayjs.unix(placed_at);
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
          const dayDiff = dayjs(new Date()).diff(placedAt, "d");
          const hourDiff = dayjs(new Date()).diff(placedAt, "h");

          return (
            <span className="body2 md:caption text-osmoverse-300">
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
      <tr
        data-transaction-hash={order.placed_tx}
        style={style}
        className={classNames(
          gridClasses,
          "xl:-mx-4 xl:items-center xl:overflow-visible xl:px-4 xl:hover:cursor-pointer xl:hover:bg-osmoverse-900 sm:[&>td]:!py-0"
        )}
        onClick={() => onOrderSelect(order)}
      >
        <td className="flex items-center justify-center !px-0 !text-left xl:hidden">
          <div className="subtitle1 rounded-full bg-osmoverse-alpha-850 p-3">
            <Icon
              id="coins"
              width={24}
              height={24}
              className={classNames("h-6 w-6", {
                "text-rust-400": order_direction === "ask",
                "text-bullish-400": order_direction === "bid",
              })}
            />
          </div>
        </td>
        <td className="!px-0 !text-left">
          <div className="flex items-center">
            <div className="flex flex-col gap-1">
              <p
                className={classNames(
                  "body2 md:caption inline-flex w-fit items-center gap-1 text-osmoverse-300",
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
              <div className="md:body2 inline-flex items-center gap-2">
                <span>
                  {order_direction === "bid"
                    ? t("limitOrders.buy")
                    : t("limitOrders.sell")}{" "}
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
        <td className="!px-0 !text-left xl:hidden">
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
        <td className="!px-0 !text-left xl:!py-0 md:hidden">
          <div className="flex flex-col gap-1">
            <p className="body2 text-osmoverse-300">{formattedTime}</p>
            <p>{formattedDate}</p>
          </div>
        </td>
        <td
          className={classNames("!px-0 !text-left xl:!py-0", {
            "flex items-center xl:justify-end": status === "filled",
          })}
        >
          <div className="flex flex-col gap-1 xl:items-end xl:justify-end">
            {statusComponent}
            <span
              className={classNames(
                {
                  "text-bullish-400":
                    status === "filled" || status === "fullyClaimed",
                  "text-osmoverse-300":
                    status === "open" || status === "partiallyFilled",
                  "text-osmoverse-500": status === "cancelled",
                },
                "md:body2"
              )}
            >
              {statusString}
            </span>
          </div>
        </td>
        <td className="flex w-[150px] items-center justify-end !px-0 !text-left xl:hidden">
          <ActionsCell order={order} refetch={refetch} />
        </td>
      </tr>
    );
  }
);
