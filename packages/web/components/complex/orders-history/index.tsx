import {
  DEFAULT_VS_CURRENCY,
  getOrderLastActivityAt,
  MappedLimitOrder,
} from "@osmosis-labs/server";
import { CoinPretty, Dec, Int, PricePretty } from "@osmosis-labs/unit";
import type { SortDirection } from "@osmosis-labs/utils";
import { useWindowVirtualizer } from "@tanstack/react-virtual";
import classNames from "classnames";
import dayjs from "dayjs";
import Image from "next/image";
import Link from "next/link";
import { parseAsStringLiteral, useQueryState } from "nuqs";
import { memo, useCallback, useEffect, useMemo, useState } from "react";

import { Icon } from "~/components/assets";
import { ActionsCell } from "~/components/complex/orders-history/cells/actions";
import { OrderProgressBar } from "~/components/complex/orders-history/cells/filled-progress";
import { OrderModal } from "~/components/complex/orders-history/order-modal";
import { SearchBox } from "~/components/input";
import { Intersection } from "~/components/intersection";
import { Spinner } from "~/components/loaders";
import { SortHeader } from "~/components/table/headers/sort";
import { Tooltip } from "~/components/tooltip";
import { GenericDisclaimer } from "~/components/tooltip/generic-disclaimer";
import { Button } from "~/components/ui/button";
import { ButtonGroup, ButtonGroupItem } from "~/components/ui/button-group";
import { EntityImage } from "~/components/ui/entity-image";
import { OsmosisChainInfo } from "~/config/chain";
import {
  Breakpoint,
  useFeatureFlags,
  useTranslation,
  useWalletSelect,
  useWindowSize,
} from "~/hooks";
import {
  OrderSortKey,
  useInvalidateOrderbookOrders,
  useOrderbookClaimableOrders,
  useOrderbookOrders,
} from "~/hooks/limit-orders/use-orderbook";
import { useWallet } from "~/hooks/use-wallet";
import { formatDate, formatDateTime } from "~/utils/date";
import {
  formatFiatPrice,
  formatPretty,
  getPriceExtendedFormatOptions,
} from "~/utils/formatter";
import { getLogoURIs } from "~/utils/logo-uri";

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
// The status cell shows each closed order's last activity, so its column sorts by that.
const sortKeys: Record<string, OrderSortKey> = {
  orderPlaced: "placedAt",
  status: "lastActivity",
};

// The direction and asset filters live in the URL so the asset page can deep
// link here, and so the toggle can be rendered beside the transactions tabs
// while the table reads the same state.
const ORDER_SIDES = ["all", "bid", "ask"] as const;
const sideQueryParser = parseAsStringLiteral(ORDER_SIDES).withDefault("all");
const ASSET_QUERY = { defaultValue: "", clearOnDefault: true };

/** Buy/Sell/All direction filter, kept in the URL (`?side=`). */
export function OrderDirectionToggle() {
  const { t } = useTranslation();
  const [side, setSide] = useQueryState("side", sideQueryParser);
  return (
    <ButtonGroup
      value={side}
      onValueChange={(value) => setSide(value as (typeof ORDER_SIDES)[number])}
    >
      <ButtonGroupItem value="all" label={t("limitOrders.all")} />
      <ButtonGroupItem value="bid" label={t("limitOrders.buy")} />
      <ButtonGroupItem value="ask" label={t("limitOrders.sell")} />
    </ButtonGroup>
  );
}

/**
 * Asset filter, kept in the URL (`?asset=`). Editing the field drops the asset
 * page deep link's exact-denom match (`?assetDenom=`) and switches to the typed
 * base-symbol search.
 */
export function OrderAssetSearch({ className }: { className?: string }) {
  const { t } = useTranslation();
  const [assetFilter, setAssetFilter] = useQueryState("asset", ASSET_QUERY);
  const [, setAssetDenomFilter] = useQueryState("assetDenom", ASSET_QUERY);
  return (
    <SearchBox
      className={className}
      size="small"
      placeholder={t("limitOrders.filterByAsset")}
      currentValue={assetFilter}
      onInput={(value) => {
        setAssetFilter(value);
        setAssetDenomFilter("");
      }}
    />
  );
}

/**
 * Info tooltip for the orders list. Shown beside the "Your orders" title on the
 * pool page and beside the "Orders" tab on the transactions page, rather than
 * repeated on every group header.
 */
export function OrderHistoryInfoTooltip() {
  const { t } = useTranslation();
  return (
    <GenericDisclaimer
      title={t("limitOrders.howPayoutsWork")}
      body={t("limitOrders.payoutNote")}
    >
      <div className="flex h-6 w-6 items-center justify-center rounded-full transition-colors hover:bg-osmoverse-800">
        <Icon
          id="question"
          className="h-3.5 w-3.5 text-wosmongton-200"
          width={24}
          height={24}
          viewBox="0 0 24 24"
        />
      </div>
    </GenericDisclaimer>
  );
}

const gridClasses =
  "grid grid-cols-[80px_4fr_2fr_2fr_2fr_150px] md:grid-cols-[2fr_1fr] xl:grid-cols-[2fr_1fr_1fr]";
const compactGridClasses = "grid grid-cols-[2fr_1fr_1fr]";

export const OrderHistory = ({
  selectedOrder,
  onOrderSelect,
  onSelectedOrderChange,
  orderbookAddress,
  title,
}: {
  selectedOrder?: MappedLimitOrder;
  /** Omit on a page that doesn't own the selection; the list then self-hosts a centered modal. */
  onOrderSelect?: (order: MappedLimitOrder) => void;
  /** Receives each refetched copy of the selected order. */
  onSelectedOrderChange?: (order: MappedLimitOrder) => void;
  /** When set, show only this book's orders (and self-host the detail modal). */
  orderbookAddress?: string;
  /** Optional heading shown in the toolbar beside the filter toggle (the pool embed). */
  title?: string;
}) => {
  // Opt out of the React Compiler: `useWindowVirtualizer` returns a stable
  // virtualizer whose `getVirtualItems()`/`getTotalSize()` change on scroll, so
  // memoized reads would keep stale rows. The compiler only flags
  // `useVirtualizer` as incompatible, not the window variant.
  "use no memo";

  const featureFlags = useFeatureFlags();
  const { t } = useTranslation();
  const { address, isWalletConnected } = useWallet();
  const [scrollMargin, setScrollMargin] = useState(0);
  // Re-measured when the page layout resizes, e.g. a banner above the table loads.
  const listRef = useCallback((el: HTMLTableElement | null) => {
    if (!el) return;
    const measure = () => setScrollMargin(el.offsetTop);
    measure();
    if (typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(measure);
    observer.observe(document.body);
    return () => observer.disconnect();
  }, []);
  const { onOpenWalletSelect, isLoading: isWalletLoading } = useWalletSelect();
  const { isMobile, isExtraLargeDesktop } = useWindowSize(Breakpoint.md);
  const { isMobile: isLargeScreen } = useWindowSize(Breakpoint.xl);

  // The transactions page owns the selected order and renders the detail modal
  // itself. When those props are absent (the orderbook pool page), self-host the
  // selection in a centered modal. The inline side panel stays off there: the
  // pool page is too narrow to fit the table and the panel side by side.
  const selfHosted = !onOrderSelect;
  const [internalSelectedOrder, setInternalSelectedOrder] =
    useState<MappedLimitOrder>();
  const effectiveSelectedOrder = selfHosted
    ? internalSelectedOrder
    : selectedOrder;
  const handleOrderSelect = useCallback(
    (order: MappedLimitOrder) =>
      onOrderSelect ? onOrderSelect(order) : setInternalSelectedOrder(order),
    [onOrderSelect]
  );
  const handleSelectedOrderChange = useCallback(
    (order: MappedLimitOrder) =>
      onSelectedOrderChange
        ? onSelectedOrderChange(order)
        : setInternalSelectedOrder(order),
    [onSelectedOrderChange]
  );
  // Clear the self-hosted selection when the wallet or book changes (including a
  // disconnect, which empties `address`), so the modal can't reopen a previous
  // wallet's or book's order. Controlled callers own their own selection.
  useEffect(() => {
    if (!selfHosted) return;
    // eslint-disable-next-line hooks-compat/set-state-in-effect -- resets the self-hosted selection on a wallet or book change so a stale order is not shown; runs only when those identities change
    setInternalSelectedOrder(undefined);
  }, [selfHosted, address, orderbookAddress]);
  // The toggle and search that write these are rendered by the toolbar below
  // (the embedded pool page) or beside the transactions tabs; here we only read
  // the URL state. `side` is the Buy/Sell filter, `asset` the typed base-symbol
  // search, and `assetDenom` the asset-page deep link's exact coinMinimalDenom.
  const [dirFilter] = useQueryState("side", sideQueryParser);
  const [assetFilter] = useQueryState("asset", ASSET_QUERY);
  const [assetDenomFilter] = useQueryState("assetDenom", ASSET_QUERY);

  // The page shows the details panel from xxxl, like the trade history's. It
  // leaves too little width for every column, so the table takes the layout it
  // has on xl screens while the panel is open.
  const isDetailsOpen =
    isExtraLargeDesktop && !!effectiveSelectedOrder && !selfHosted;
  const compact = isLargeScreen || isDetailsOpen;
  const [sortKey, setSortKey_] = useState<OrderSortKey>("placedAt");
  // Always sorted, so a click on the sorted column flips its direction instead of clearing it.
  const setSortKey = useCallback((key: OrderSortKey | undefined) => {
    if (key) setSortKey_(key);
  }, []);
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");

  const {
    orders,
    pagesLoaded,
    historyUnavailable,
    isLoading,
    isError,
    fetchNextPage,
    isFetchingNextPage,
    hasNextPage,
    refetch,
    isRefetching,
  } = useOrderbookOrders({
    userAddress: address ?? "",
    // A single book's orders can be scattered thin across pages (the query
    // fetches every book and we filter client-side), so page larger when scoped.
    pageSize: orderbookAddress ? 100 : 20,
    refetchInterval: featureFlags.sqsActiveOrders ? 10000 : 30000,
    sort: { keyPath: sortKey, direction: sortDirection },
  });

  // A claim or cancel from the self-hosted modal lands a block later, so refresh
  // on a 1s/2s/4s schedule rather than once, which usually reads stale.
  const invalidateOrderbookOrders = useInvalidateOrderbookOrders();

  // Scope to one book when asked (the pool page), then to one side when the
  // Buy/Sell filter is set. `bookOrders` drives the empty state; `displayOrders`
  // drives the table and the claimable count.
  const bookOrders = useMemo(
    () =>
      orderbookAddress
        ? orders.filter((o) => o.orderbookAddress === orderbookAddress)
        : orders,
    [orders, orderbookAddress]
  );
  // The asset filter applies only on the full view; when embedded on a single
  // book the list is already scoped, so the field is hidden and ignored.
  const assetQuery = orderbookAddress ? "" : assetFilter.trim().toLowerCase();
  const assetDenom = orderbookAddress ? "" : assetDenomFilter;
  const displayOrders = useMemo(() => {
    const byDirection =
      dirFilter === "all"
        ? bookOrders
        : bookOrders.filter((o) => o.order_direction === dirFilter);
    // Deep link: match the exact denom on base or quote, like the asset page, so
    // a USDC link keeps OSMO/USDC orders and an ATOM link excludes stATOM/qATOM.
    if (assetDenom) {
      return byDirection.filter(
        (o) =>
          o.baseAsset?.coinMinimalDenom === assetDenom ||
          o.quoteAsset?.coinMinimalDenom === assetDenom
      );
    }
    if (!assetQuery) return byDirection;
    // Typed text: base-symbol substring. "osmo" matches an OSMO/USDC order.
    return byDirection.filter((o) =>
      o.baseAsset?.symbol?.toLowerCase().includes(assetQuery)
    );
  }, [bookOrders, dirFilter, assetQuery, assetDenom]);
  // The page keeps the copy of the selected order taken on click. Hand it each
  // refetched copy, so the details show the order's current status and build the
  // claim or cancel from its current fill. An order no longer in the loaded
  // pages keeps its last copy.
  const refetchedSelectedOrder =
    effectiveSelectedOrder &&
    orders.find(
      (o) =>
        o.order_id === effectiveSelectedOrder.order_id &&
        o.orderbookAddress === effectiveSelectedOrder.orderbookAddress
    );
  useEffect(() => {
    if (
      refetchedSelectedOrder &&
      refetchedSelectedOrder !== effectiveSelectedOrder
    ) {
      // eslint-disable-next-line hooks-compat/set-state-in-effect -- mirrors the refetched copy of the selected order into state so the open detail modal tracks its latest status; the inequality guard above stops a render loop
      handleSelectedOrderChange(refetchedSelectedOrder);
    }
  }, [
    refetchedSelectedOrder,
    effectiveSelectedOrder,
    handleSelectedOrderChange,
  ]);
  const groupedOrders = useMemo(
    () => groupOrdersByStatus(displayOrders),
    [displayOrders]
  );
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
    // Group-header rows (string entries) are short; data rows are taller. A
    // single height for both left big gaps around the "Pending"/"Past" headers.
    estimateSize: (index) => {
      if (isMobile) return 60;
      return typeof rows[index] === "string" ? 48 : 80;
    },
    paddingEnd: 110,
    overscan: 10,
    scrollMargin,
    paddingStart: 45,
  });
  const filledOrdersInDisplay = useMemo(() => {
    return displayOrders.filter((o) => o.status === "filled");
  }, [displayOrders]);

  const { claimAllOrders, count: filledOrdersCount } =
    useOrderbookClaimableOrders({
      userAddress: address ?? "",
      disabled: isLoading || filledOrdersInDisplay.length === 0 || isRefetching,
      refetchInterval: featureFlags.sqsActiveOrders ? 10000 : 30000,
      orderbookAddress,
      orderDirection: dirFilter === "all" ? undefined : dirFilter,
      // Scope Claim All to the visible set: the deep link's exact denom when set,
      // otherwise the typed base-symbol substring.
      baseSymbol: assetDenom ? undefined : assetQuery || undefined,
      assetDenom: assetDenom || undefined,
    });

  // The in-flight flag lives here, not in the group header, because a filter
  // change can unmount the header (empty list) and would otherwise reset it,
  // letting a second Claim All start while the first is still pending.
  const [isClaimingAll, setIsClaimingAll] = useState(false);
  const claimOrders = useCallback(async () => {
    setIsClaimingAll(true);
    try {
      await claimAllOrders();
      await refetch();
    } catch {
      // Intentionally swallowed: this handler previously only logged analytics.
    } finally {
      setIsClaimingAll(false);
    }
  }, [claimAllOrders, refetch]);

  const showConnectWallet = !isWalletConnected && !isWalletLoading;

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
                    chainId: OsmosisChainInfo.chainId,
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

  if (bookOrders.length === 0 && !isLoading && isError) {
    return (
      <div className="flex flex-col items-center justify-center gap-6">
        <h6>{t("limitOrders.historyTable.errorState.title")}</h6>
        <p className="body2 text-osmoverse-300">
          {t("limitOrders.historyTable.errorState.subtitle")}
        </p>
      </div>
    );
  }

  // Only a definitive empty state once pagination is exhausted. While more
  // pages may hold this book's orders, fall through so the table renders the
  // pagination sentinel and keeps loading, instead of a premature "no orders".
  if (
    bookOrders.length === 0 &&
    !isLoading &&
    !hasNextPage &&
    !isFetchingNextPage
  ) {
    return (
      <div className="flex flex-col items-center justify-center gap-6">
        {historyUnavailable && (
          <p className="body2 text-center text-osmoverse-300">
            {t("limitOrders.historyTable.historyUnavailable")}
          </p>
        )}
        <Image
          src="/images/ion-thumbs-up.svg"
          alt="ion thumbs up"
          width={120}
          height={80}
        />
        {orderbookAddress ? (
          // On a book's own page the trade widget is right here, so name the
          // pair and keep the user on the page instead of linking away to "/".
          <>
            <h6>{t("limitOrders.historyTable.emptyState.bookTitle")}</h6>
            <p className="body2 text-osmoverse-300">
              {t("pool.orderbookPool.noOrdersDesc")}
            </p>
          </>
        ) : (
          <>
            <h6>{t("limitOrders.historyTable.emptyState.title")}</h6>
            <p className="body2 inline-flex items-center gap-1 text-osmoverse-300">
              {t("limitOrders.historyTable.emptyState.subtitle")}
              <Link href={"/"} className="text-wosmongton-300">
                {t("limitOrders.startTrading")}
              </Link>
            </p>
          </>
        )}
      </div>
    );
  }

  return (
    <div
      className={classNames(
        "mt-3 flex flex-col",
        // Beside the details panel, keep about the width the trade history tab
        // keeps there, which its search and filter bar sets.
        isDetailsOpen
          ? "min-w-[51rem] overflow-visible"
          : "overflow-x-scroll xl:overflow-visible"
      )}
    >
      {orderbookAddress && (
        // Embedded on a book's page: show the pair title and the Buy/Sell
        // toggle. The transactions page renders its own toggle and search
        // beside the tabs instead, so no toolbar is drawn here for it.
        <div className="mb-4 flex items-center gap-3">
          {title && (
            <div className="mr-auto flex items-center gap-2">
              <h6>{title}</h6>
              <OrderHistoryInfoTooltip />
            </div>
          )}
          <OrderDirectionToggle />
        </div>
      )}
      {historyUnavailable && (
        <p className="body2 mb-3 text-osmoverse-300">
          {t("limitOrders.historyTable.historyUnavailable")}
        </p>
      )}
      <table
        className={classNames(
          "relative table-auto",
          isDetailsOpen ? "min-w-[100%]" : "min-w-[900px] xl:min-w-[100%]"
        )}
        ref={listRef}
      >
        {!isLoading && (
          <thead className="border-b border-osmoverse-700 bg-osmoverse-1000">
            <tr
              className={classNames(
                "bg-osmoverse-1000",
                isDetailsOpen ? compactGridClasses : gridClasses
              )}
            >
              {headers.map((header) => (
                <th
                  key={header}
                  className={classNames("flex items-center !px-0", {
                    "md:hidden": !mdHeaders.includes(header),
                    "xl:hidden": !lgHeaders.includes(header),
                    hidden: isDetailsOpen && !lgHeaders.includes(header),
                    "justify-end": compact && header === "status",
                  })}
                >
                  {sortKeys[header] ? (
                    <SortHeader<OrderSortKey>
                      className={classNames(
                        "body2 sm:caption",
                        compact && header === "status"
                          ? "ml-auto mr-0"
                          : "mr-auto ml-0"
                      )}
                      label={t(`limitOrders.historyTable.columns.${header}`)}
                      sortKey={sortKeys[header]}
                      currentSortKey={sortKey}
                      currentDirection={sortDirection}
                      setSortKey={setSortKey}
                      setSortDirection={setSortDirection}
                    />
                  ) : (
                    header !== "amount" && (
                      <small className="body2 sm:caption">
                        {t(`limitOrders.historyTable.columns.${header}`)}
                      </small>
                    )
                  )}
                </th>
              ))}
              {!compact && <th />}
            </tr>
          </thead>
        )}
        <tbody
          className={classNames("bg-transparent xl:overflow-visible", {
            "overflow-visible": isDetailsOpen,
          })}
          style={{ height: `${rowVirtualizer.getTotalSize()}px` }}
        >
          {isLoading ? (
            <tr className="flex items-center justify-center py-10">
              <td colSpan={headers.length + 1} className="!p-0">
                <Spinner className="!h-10 !w-10" />
              </td>
            </tr>
          ) : rows.length === 0 ? (
            <tr className="flex items-center justify-center py-10">
              <td colSpan={headers.length + 1} className="!p-0">
                {hasNextPage || isFetchingNextPage ? (
                  // More pages may still hold this book's orders; the sentinel
                  // below keeps fetching, so show progress, not "no orders".
                  <Spinner className="!h-10 !w-10" />
                ) : (
                  <p className="body2 text-osmoverse-300">
                    {t("limitOrders.noMatchingOrders")}
                  </p>
                )}
              </td>
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
                    claiming={isClaimingAll}
                  />
                );
              }

              const order = row as MappedLimitOrder;
              // style.left = isLargeScreen ? "rem" : "0";
              style.width = compact ? "calc(100% + 2rem)" : "100%";
              return (
                <TableOrderRow
                  // Keyed by order, so a row's pending claim or cancel stays with its order when the list reorders.
                  key={`${order.orderbookAddress}-${order.order_id}`}
                  order={order}
                  style={style}
                  refetch={refetch}
                  onOrderSelect={handleOrderSelect}
                  forceCompact={isDetailsOpen}
                  isSelected={
                    isDetailsOpen &&
                    effectiveSelectedOrder.order_id === order.order_id &&
                    effectiveSelectedOrder.orderbookAddress ===
                      order.orderbookAddress
                  }
                />
              );
            })
          )}
        </tbody>
      </table>
      <Intersection
        // Remount per loaded page so a fresh observer reports its state again.
        // A still-visible sentinel then keeps paging until the view has orders
        // or the pages run out, which plain visibility transitions miss once the
        // sentinel stops moving. The key only advances on a successful page, so
        // a failed fetch can't loop; the refetch poll recovers it.
        key={pagesLoaded}
        onVisible={() => {
          if (hasNextPage && !isFetchingNextPage && !isLoading) {
            fetchNextPage();
          }
        }}
      />
      {selfHosted && (
        <OrderModal
          order={internalSelectedOrder}
          onRequestClose={() => setInternalSelectedOrder(undefined)}
          onRequestRefresh={invalidateOrderbookOrders}
        />
      )}
    </div>
  );
};

const TableGroupHeader = ({
  group,
  style,
  filledOrdersCount,
  claimOrders,
  claiming,
}: {
  group: string;
  style: object;
  filledOrdersCount: number;
  claimOrders: () => Promise<void>;
  claiming: boolean;
}) => {
  const { t } = useTranslation();

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
                <span className="subtitle1">
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
                <div className="flex h-6 w-6 items-center justify-center rounded-full transition-colors hover:bg-osmoverse-800">
                  <Icon
                    id="question"
                    className="h-3.5 w-3.5 text-wosmongton-200"
                    width={24}
                    height={24}
                    viewBox="0 0 24 24"
                  />
                </div>
              </GenericDisclaimer>
            </div>
          </div>
        </td>
        <td className="flex items-center justify-end md:!p-0">
          <button
            className="md:scale-1/2 flex items-center justify-center rounded-[48px] bg-wosmongton-700 py-2 px-4 disabled:opacity-50"
            onClick={claimOrders}
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
      <td colSpan={headers.length + 1} className="!p-0">
        <span className="subtitle1">
          {group === "pending"
            ? t("limitOrders.orderHistoryHeaders.pending")
            : t("limitOrders.orderHistoryHeaders.past")}
        </span>
      </td>
    </tr>
  );
};

const TableOrderRow = memo(
  ({
    order,
    style,
    refetch,
    onOrderSelect,
    forceCompact,
    isSelected,
  }: {
    order: MappedLimitOrder;
    style: object;
    refetch: () => Promise<any>;
    onOrderSelect: (order: MappedLimitOrder) => void;
    /** Use the xl layout at any width, e.g. while the details panel is open. */
    forceCompact: boolean;
    isSelected: boolean;
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
      percentFilled,
      totalFilled,
    } = order;

    // A cancelled order that partly filled is shown by what filled; the modal adds what was returned.
    const isPartlyFilledCancel =
      status === "cancelled" && percentFilled.isPositive();
    const isUnfilledCancel = status === "cancelled" && !isPartlyFilledCancel;
    const shownQuantity = isPartlyFilledCancel ? totalFilled : placed_quantity;
    const shownOutput = isPartlyFilledCancel
      ? output.mul(percentFilled)
      : output;

    // An unfilled cancel only returned its input, so name the asset that went back to the wallet.
    const lineAsset =
      isUnfilledCancel && order_direction === "bid" ? quoteAsset : baseAsset;

    // The mapper stores 0 when Numia has no place time, so leave it blank rather than show 1 Jan 1970.
    const placedAt = placed_at ? dayjs.unix(placed_at) : undefined;
    const formattedTime = placedAt?.format("h:mm A");
    const formattedDate = placedAt && formatDate(placedAt);

    const lastActivityUnix = getOrderLastActivityAt(order);
    const lastActivityAt = lastActivityUnix && dayjs.unix(lastActivityUnix);

    const statusString = (() => {
      switch (status) {
        case "open":
        case "partiallyFilled":
          return t("limitOrders.open");
        case "filled":
          return t("limitOrders.filled");
        case "fullyClaimed":
          return t("limitOrders.filled");
        case "cancelled": {
          if (!isPartlyFilledCancel) return t("limitOrders.cancelled");
          // Like OrderProgressBar, show a fill under 1% as 1% so it never reads "0% filled".
          const percent = percentFilled.lt(new Dec(0.01))
            ? new Int(1)
            : percentFilled.mul(new Dec(100)).truncate();
          return (
            <span className="text-bullish-400">
              {t("limitOrders.filledPercent", {
                percent: percent.toString(),
              })}
            </span>
          );
        }
      }
    })();

    const lastActivity = (() => {
      if (!lastActivityAt) return;
      const now = dayjs(new Date());
      const dayDiff = now.diff(lastActivityAt, "d");
      const hourDiff = now.diff(lastActivityAt, "h");
      const minuteDiff = Math.max(now.diff(lastActivityAt, "m"), 1);

      return (
        <Tooltip
          content={formatDateTime(lastActivityAt)}
          className="w-fit"
          enablePropagation
        >
          <span className="body2 md:caption text-osmoverse-300">
            {dayDiff > 0
              ? t("limitOrders.daysAgo", { days: dayDiff.toString() })
              : hourDiff > 0
                ? t("limitOrders.hoursAgo", { hours: hourDiff.toString() })
                : t("limitOrders.minutesAgo", {
                    minutes: minuteDiff.toString(),
                  })}
          </span>
        </Tooltip>
      );
    })();

    const statusComponent = (() => {
      switch (status) {
        case "open":
        case "partiallyFilled":
          return <OrderProgressBar order={order} />;
        default:
          return lastActivity;
      }
    })();
    return (
      <tr
        data-transaction-hash={order.placed_tx}
        style={style}
        className={classNames(
          forceCompact ? compactGridClasses : gridClasses,
          "hover:cursor-pointer hover:bg-osmoverse-900 xl:-mx-4 xl:items-center xl:overflow-visible xl:px-4 sm:[&>td]:!py-0",
          {
            "-mx-4 items-center overflow-visible px-4": forceCompact,
            "bg-osmoverse-850": isSelected,
          }
        )}
        onClick={() => onOrderSelect(order)}
        tabIndex={0}
        onKeyDown={(e) => {
          // Ignore keys aimed at the row's own Cancel/Claim buttons.
          if (e.target !== e.currentTarget) return;
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onOrderSelect(order);
          }
        }}
      >
        <td
          className={classNames(
            "flex items-center justify-center !px-0 !text-left xl:hidden",
            { hidden: forceCompact }
          )}
        >
          <div className="subtitle1 rounded-full bg-osmoverse-alpha-850 p-3">
            <Icon
              id="coins"
              width={24}
              height={24}
              className={classNames("h-6 w-6", {
                "text-osmoverse-500": isUnfilledCancel,
                "text-rust-400": !isUnfilledCancel && order_direction === "ask",
                "text-bullish-400":
                  !isUnfilledCancel && order_direction === "bid",
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
                      order_direction === "ask" ? shownQuantity : shownOutput
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
                      order_direction === "ask" ? shownOutput : shownQuantity
                    )
                  )}
                </span>
              </p>
              <div className="md:body2 inline-flex items-center gap-2">
                <span>
                  {isUnfilledCancel ? (
                    <>
                      {t("limitOrders.returned")}{" "}
                      {formatPretty(
                        new CoinPretty(
                          {
                            coinDecimals: lineAsset?.decimals ?? 0,
                            coinDenom: lineAsset?.symbol ?? "",
                            coinMinimalDenom: lineAsset?.coinMinimalDenom ?? "",
                          },
                          placed_quantity
                        ).hideDenom(true)
                      )}
                    </>
                  ) : (
                    <>
                      {order_direction === "bid"
                        ? t("limitOrders.buy")
                        : t("limitOrders.sell")}{" "}
                      {formatFiatPrice(
                        new PricePretty(
                          DEFAULT_VS_CURRENCY,
                          order_direction === "bid"
                            ? shownQuantity /
                                Number(
                                  new Dec(10)
                                    .pow(new Int(quoteAsset?.decimals ?? 0))
                                    .toString()
                                )
                            : shownOutput.quo(
                                new Dec(10).pow(
                                  new Int(quoteAsset?.decimals ?? 0)
                                )
                              )
                        ),
                        2
                      )}{" "}
                      {t("limitOrders.of")}
                    </>
                  )}
                </span>
                <div className="h-5 w-5 shrink-0 overflow-hidden rounded-full">
                  <EntityImage
                    width={20}
                    height={20}
                    logoURIs={getLogoURIs(lineAsset?.currency.coinImageUrl)}
                    name={lineAsset?.rawAsset.name ?? ""}
                    symbol={lineAsset?.rawAsset.symbol ?? ""}
                  />
                </div>
                <span>{lineAsset?.symbol}</span>
              </div>
            </div>
          </div>
        </td>
        <td
          className={classNames("!px-0 !text-left xl:hidden", {
            hidden: forceCompact,
          })}
        >
          <div className="flex flex-col gap-1">
            <p className="body2 text-osmoverse-300">1 {baseAsset?.symbol} =</p>
            <p>
              {formatPretty(new PricePretty(DEFAULT_VS_CURRENCY, price), {
                ...getPriceExtendedFormatOptions(price),
              })}
            </p>
          </div>
        </td>
        <td
          className={classNames("!px-0 !text-left xl:!py-0 md:hidden", {
            "!py-0": forceCompact,
          })}
        >
          <div className="flex flex-col gap-1">
            <p className="body2 text-osmoverse-300">{formattedTime}</p>
            <p>{formattedDate}</p>
          </div>
        </td>
        <td
          className={classNames("!px-0 !text-left xl:!py-0", {
            "flex items-center xl:justify-end": status === "filled",
            "!py-0": forceCompact,
            "justify-end": forceCompact && status === "filled",
          })}
        >
          <div
            className={classNames(
              "flex flex-col gap-1 xl:items-end xl:justify-end",
              { "items-end justify-end": forceCompact }
            )}
          >
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
        <td
          className={classNames(
            "flex w-[150px] items-center justify-end !px-0 !text-left xl:hidden",
            { hidden: forceCompact }
          )}
        >
          <ActionsCell order={order} refetch={refetch} />
        </td>
      </tr>
    );
  }
);
