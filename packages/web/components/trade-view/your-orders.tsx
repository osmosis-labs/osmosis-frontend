import { DEFAULT_VS_CURRENCY, MappedLimitOrder } from "@osmosis-labs/server";
import { CoinPretty, Dec, Int, PricePretty } from "@osmosis-labs/unit";
import classNames from "classnames";
import dayjs from "dayjs";
import Image from "next/image";
import { FunctionComponent, memo, useCallback, useMemo, useState } from "react";

import { Icon } from "~/components/assets";
import { ActionsCell } from "~/components/complex/orders-history/cells/actions";
import { OrderProgressBar } from "~/components/complex/orders-history/cells/filled-progress";
import { Spinner } from "~/components/loaders/spinner";
import { Tooltip } from "~/components/tooltip/tooltip";
import { Button } from "~/components/ui/button";
import { EntityImage } from "~/components/ui/entity-image";
import { useFeatureFlags, useTranslation, useWalletSelect } from "~/hooks";
import {
  useOrderbookClaimableOrders,
  useOrderbookOrders,
} from "~/hooks/limit-orders/use-orderbook";
import { useWallet } from "~/hooks/use-wallet";
import {
  formatFiatPrice,
  formatPretty,
  getPriceExtendedFormatOptions,
} from "~/utils/formatter";

/** The connected wallet's orders on one orderbook, with claim and cancel. */
export const OrderbookYourOrders: FunctionComponent<{
  contractAddress: string;
}> = ({ contractAddress }) => {
  const { address: userAddress, isWalletConnected } = useWallet();
  const { t } = useTranslation();
  const { isLoading: isWalletLoading } = useWalletSelect();
  const featureFlags = useFeatureFlags();

  // User orders — fetch all, then filter to this contract
  const {
    orders: allOrders,
    isLoading: isOrdersLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
    isRefetching,
  } = useOrderbookOrders({
    userAddress: userAddress ?? "",
    pageSize: 100,
    refetchInterval: featureFlags.sqsActiveOrders ? 10000 : 30000,
  });

  const poolOrders = useMemo(
    () => allOrders.filter((o) => o.orderbookAddress === contractAddress),
    [allOrders, contractAddress]
  );

  const [dirFilter, setDirFilter] = useState<"all" | "bid" | "ask">("all");
  const filteredOrders = useMemo(
    () =>
      dirFilter === "all"
        ? poolOrders
        : poolOrders.filter((o) => o.order_direction === dirFilter),
    [poolOrders, dirFilter]
  );

  // Claimable orders for this pool
  const { claimAllOrders } = useOrderbookClaimableOrders({
    userAddress: userAddress ?? "",
    disabled: isOrdersLoading || isRefetching,
    refetchInterval: featureFlags.sqsActiveOrders ? 10000 : 30000,
    orderbookAddress: contractAddress,
  });

  const claimablePoolOrders = useMemo(
    () =>
      poolOrders.filter(
        (o) => o.status === "filled" && o.orderbookAddress === contractAddress
      ),
    [poolOrders, contractAddress]
  );

  const claimOrders = useCallback(async () => {
    await claimAllOrders();
    await refetch();
  }, [claimAllOrders, refetch]);

  const showConnectWallet = !isWalletConnected && !isWalletLoading;

  return (
    <div className="rounded-3xl border border-osmoverse-700 p-6">
      <div className="mb-4 flex items-center gap-3">
        <h6>{t("pool.orderbookPool.yourOrders")}</h6>
        <div className="ml-auto flex gap-1 rounded-lg bg-osmoverse-800 p-0.5">
          {(["all", "bid", "ask"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setDirFilter(f)}
              className={`rounded-md px-3 py-1 text-xs transition-colors ${
                dirFilter === f
                  ? "bg-osmoverse-700 text-white-full"
                  : "text-osmoverse-400 hover:text-osmoverse-200"
              }`}
            >
              {f === "all"
                ? t("pool.orderbookPool.filterAll")
                : f === "bid"
                  ? t("pool.orderbookPool.filterBuy")
                  : t("pool.orderbookPool.filterSell")}
            </button>
          ))}
        </div>
      </div>

      {showConnectWallet ? (
        <div className="flex flex-col items-center gap-4 py-10 text-center">
          <Image
            src="/images/place-limit-order.svg"
            alt="place a limit order"
            width={120}
            height={80}
          />
          <p className="body2 text-osmoverse-300">
            {t("limitOrders.historyTable.emptyState.connectSubtitle")}
          </p>
        </div>
      ) : isOrdersLoading ? (
        <div className="flex justify-center py-10">
          <Spinner className="!h-10 !w-10" />
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="flex flex-col items-center gap-2 py-10 text-center">
          <Image
            src="/images/place-limit-order.svg"
            alt="no orders"
            width={120}
            height={80}
          />
          <p className="body2 text-osmoverse-300">
            {t("pool.orderbookPool.noOrders")}
          </p>
          <p className="caption text-osmoverse-500">
            {t("pool.orderbookPool.noOrdersDesc")}
          </p>
          {/* The wallet's orders are paged across every book, so this book's
              orders can all be on a later page. */}
          <LoadMoreButton
            hasNextPage={hasNextPage}
            isFetchingNextPage={isFetchingNextPage}
            fetchNextPage={fetchNextPage}
          />
        </div>
      ) : (
        <OrdersTable
          orders={filteredOrders}
          refetch={refetch}
          claimableCount={claimablePoolOrders.length}
          onClaimAll={claimOrders}
          hasNextPage={hasNextPage}
          isFetchingNextPage={isFetchingNextPage}
          fetchNextPage={fetchNextPage}
        />
      )}
    </div>
  );
};

// ── Orders table ───────────────────────────────────────────────────────────

const gridClasses =
  "grid grid-cols-[80px_4fr_2fr_2fr_2fr_150px] md:grid-cols-[2fr_1fr]";

const OrdersTable: FunctionComponent<{
  orders: MappedLimitOrder[];
  refetch: () => Promise<any>;
  claimableCount: number;
  onClaimAll: () => Promise<void>;
  hasNextPage?: boolean;
  isFetchingNextPage?: boolean;
  fetchNextPage?: () => void;
}> = ({
  orders,
  refetch,
  claimableCount,
  onClaimAll,
  hasNextPage,
  isFetchingNextPage,
  fetchNextPage,
}) => {
  const { t } = useTranslation();

  const grouped = useMemo(() => {
    const pending = orders.filter(
      (o) => o.status === "open" || o.status === "partiallyFilled"
    );
    const filled = orders.filter((o) => o.status === "filled");
    const past = orders.filter(
      (o) => o.status === "cancelled" || o.status === "fullyClaimed"
    );
    return { pending, filled, past };
  }, [orders]);

  return (
    <div className="mt-3 overflow-x-auto xl:overflow-visible">
      <table className="min-w-[900px] table-auto">
        <thead className="border-b border-osmoverse-700 bg-osmoverse-1000">
          <tr className={classNames(gridClasses)}>
            {["order", "amount", "price", "orderPlaced", "status"].map(
              (header) => (
                <th key={header} className="flex !px-0">
                  {header !== "amount" && (
                    <small className="body2">
                      {t(`limitOrders.historyTable.columns.${header}`)}
                    </small>
                  )}
                </th>
              )
            )}
            <th />
          </tr>
        </thead>
        <tbody>
          {(["filled", "pending", "past"] as const).map((group) => {
            const groupOrders = grouped[group];
            if (!groupOrders.length) return null;
            return (
              <>
                <PoolOrderGroupHeader
                  key={`group-${group}`}
                  group={group}
                  claimableCount={claimableCount}
                  onClaimAll={onClaimAll}
                />
                {groupOrders.map((order) => (
                  <OrderRow
                    key={`${order.order_id}-${order.tick_id}`}
                    order={order}
                    refetch={refetch}
                  />
                ))}
              </>
            );
          })}
        </tbody>
      </table>
      <LoadMoreButton
        hasNextPage={hasNextPage}
        isFetchingNextPage={isFetchingNextPage}
        fetchNextPage={fetchNextPage}
      />
    </div>
  );
};

const LoadMoreButton: FunctionComponent<{
  hasNextPage?: boolean;
  isFetchingNextPage?: boolean;
  fetchNextPage?: () => void;
}> = ({ hasNextPage, isFetchingNextPage, fetchNextPage }) =>
  hasNextPage ? (
    <div className="flex justify-center pt-4">
      <Button
        variant="outline"
        size="sm"
        onClick={() => fetchNextPage?.()}
        disabled={isFetchingNextPage}
      >
        {isFetchingNextPage ? <Spinner className="h-4 w-4" /> : "Load more"}
      </Button>
    </div>
  ) : null;

const PoolOrderGroupHeader: FunctionComponent<{
  group: "filled" | "pending" | "past";
  claimableCount: number;
  onClaimAll: () => Promise<void>;
}> = ({ group, claimableCount, onClaimAll }) => {
  const { t } = useTranslation();
  const [claiming, setClaiming] = useState(false);

  const claim = useCallback(async () => {
    setClaiming(true);
    try {
      await onClaimAll();
    } finally {
      setClaiming(false);
    }
  }, [onClaimAll]);

  if (group === "filled") {
    return (
      <tr className="flex w-full items-center py-2">
        <td className="flex min-w-0 flex-1 items-center gap-2 !px-0">
          <span className="subtitle1 shrink-0">
            {t("limitOrders.orderHistoryHeaders.filled")}
          </span>
          {claimableCount > 0 && (
            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#A51399]">
              <span className="md:body2 text-subtitle font-subtitle">
                {claimableCount}
              </span>
            </div>
          )}
          <Tooltip
            content={
              <div className="flex flex-col gap-1">
                <span className="caption">
                  {t("limitOrders.whatIsOrderClaim.title")}
                </span>
                <span className="caption text-osmoverse-300">
                  {t("limitOrders.whatIsOrderClaim.description")}
                </span>
              </div>
            }
            trigger="mouseenter focus"
          >
            <span className="inline-flex cursor-pointer items-center">
              <Icon
                id="question"
                className="h-6 w-6 text-wosmongton-200 hover:text-wosmongton-100"
                width={24}
                height={24}
              />
            </span>
          </Tooltip>
        </td>
        <td className="shrink-0 !px-0">
          {claimableCount > 0 && (
            <button
              className="flex items-center justify-center rounded-[48px] bg-wosmongton-700 px-4 py-2 disabled:opacity-50"
              onClick={claim}
              disabled={claiming}
            >
              {claiming && <Spinner className="mr-2 !h-2 !w-2" />}
              <span className="subtitle1">{t("limitOrders.claimAll")}</span>
            </button>
          )}
        </td>
      </tr>
    );
  }

  return (
    <tr className="flex items-center py-2">
      <td colSpan={6} className="!px-0">
        <span className="subtitle1">
          {group === "pending"
            ? t("limitOrders.orderHistoryHeaders.pending")
            : t("limitOrders.orderHistoryHeaders.past")}
        </span>
      </td>
    </tr>
  );
};

const OrderRow = memo(
  ({
    order,
    refetch,
  }: {
    order: MappedLimitOrder;
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

    const placedAt = dayjs.unix(placed_at);
    const formattedTime = placedAt.format("h:mm A");
    const formattedDate = placedAt.format("MMM D");

    const statusComponent = (() => {
      switch (status) {
        case "open":
        case "partiallyFilled":
          return <OrderProgressBar order={order} />;
        case "cancelled": {
          const dayDiff = dayjs(new Date()).diff(placedAt, "d");
          const hourDiff = dayjs(new Date()).diff(placedAt, "h");
          return (
            <span className="body2 md:caption text-osmoverse-300">
              {dayDiff > 0
                ? t("limitOrders.daysAgo", { days: dayDiff.toString() })
                : hourDiff > 0
                  ? t("limitOrders.hoursAgo", { hours: hourDiff.toString() })
                  : "<1 hour ago"}
            </span>
          );
        }
        default:
          return null;
      }
    })();

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

    return (
      <tr
        className={classNames(
          gridClasses,
          "items-center hover:bg-osmoverse-900 sm:[&>td]:!py-0"
        )}
      >
        <td className="flex items-center justify-center !px-0 !text-left">
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
              <div className="h-5 w-5 shrink-0 overflow-hidden rounded-full">
                <EntityImage
                  width={20}
                  height={20}
                  logoURIs={baseAsset?.rawAsset.logoURIs ?? { png: undefined }}
                  name={baseAsset?.rawAsset.name ?? ""}
                  symbol={baseAsset?.rawAsset.symbol ?? ""}
                />
              </div>
              <span>{baseAsset?.symbol}</span>
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
        <td className="!px-0 !text-left md:hidden">
          <div className="flex flex-col gap-1">
            <p className="body2 text-osmoverse-300">{formattedTime}</p>
            <p>{formattedDate}</p>
          </div>
        </td>
        <td
          className={classNames("!px-0 !text-left", {
            "flex items-center": status === "filled",
          })}
        >
          <div className="flex flex-col gap-1">
            {statusComponent}
            <span
              className={classNames("md:body2", {
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
        <td className="flex w-[150px] items-center justify-end !px-0 !text-left">
          <ActionsCell order={order} refetch={refetch} />
        </td>
      </tr>
    );
  }
);
