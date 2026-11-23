import classNames from "classnames";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useRouter } from "next/router";
import { parseAsStringEnum, parseAsStringLiteral, useQueryState } from "nuqs";
import {
  FunctionComponent,
  PropsWithChildren,
  ReactNode,
  useEffect,
  useMemo,
  useState,
} from "react";

import { Icon } from "~/components/assets";
import { PlaceLimitTool } from "~/components/place-limit-tool";
import { deferQueryCorrection } from "~/components/place-limit-tool/defaults";
import { SwapTool, SwapToolProps } from "~/components/swap-tool";
import {
  OrderTypeSelector,
  TRADE_TYPES,
} from "~/components/swap-tool/order-type-selector";
import {
  SwapToolTab,
  SwapToolTabs,
} from "~/components/swap-tool/swap-tool-tabs";
import { useBookPriceSelection } from "~/components/trade-tool/use-book-price-selection";
import { useCanonicalOrderbookForPair } from "~/components/trade-view/hooks";
import { useTradeViewExpanded } from "~/components/trade-view/use-trade-view-expanded";
import { useFeatureFlags, useTranslation } from "~/hooks";
import { useIsClient } from "~/hooks/use-is-client";
import { useWallet } from "~/hooks/use-wallet";
import { Breakpoint, useWindowSize } from "~/hooks/window/use-window-size";
import { PreviousTrade } from "~/pages";

// The book and orders panels are loaded only where they are shown, so they
// add nothing to the initial bundle of pages using the trade tool.
const TradeViewBook = dynamic(
  () => import("~/components/trade-view/panels").then((m) => m.TradeViewBook),
  { ssr: false }
);
const TradeViewOrders = dynamic(
  () => import("~/components/trade-view/panels").then((m) => m.TradeViewOrders),
  { ssr: false }
);
const TradeViewChart = dynamic(
  () => import("~/components/trade-view/panels").then((m) => m.TradeViewChart),
  { ssr: false }
);

const ORDERBOOK_POOL_TABS = [SwapToolTab.BUY, SwapToolTab.SELL];

interface TradeToolProps {
  swapToolProps?: SwapToolProps;
  previousTrade?: PreviousTrade;
  setPreviousTrade: (trade: PreviousTrade) => void;
  /**
   * Where the pair's order book goes when the pair has a canonical orderbook:
   * "expandable" offers an expand control that puts the book beside the
   * widget; "below" always shows the book under
   * the widget. Omit for the widget alone.
   */
  bookLayout?: "expandable" | "below";
  /**
   * For an orderbook pool's own page: Buy and Sell only, locked to the
   * pool's pair, with that pool's book beside the widget, the user's orders
   * below and no links back to the pool page.
   */
  orderbookPool?: { poolId: string; baseDenom: string; quoteDenom: string };
  /** Buy and Sell place limit orders only: no Market/Limit toggle, no market quotes. */
  limitOnly?: boolean;
  /** Show the link to the order history page under the widget. */
  showOrderHistoryLink?: boolean;
  /**
   * Shown directly under the widget card, in the widget's own column, so it
   * stays under the widget whether or not the trade view is expanded.
   */
  belowWidget?: ReactNode;
  /** Shown directly above the widget card, in the widget's own column. */
  aboveWidget?: ReactNode;
}

/**
 * Rendered height of an element, kept current with a ResizeObserver. Returns
 * a callback ref for the element and its height.
 */
function useMeasuredHeight() {
  const [element, setElement] = useState<HTMLDivElement | null>(null);
  const [height, setHeight] = useState<number>();
  useEffect(() => {
    if (!element || typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(([entry]) =>
      setHeight(entry.borderBoxSize?.[0]?.blockSize ?? entry.contentRect.height)
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, [element]);
  return [setElement, height] as const;
}

/**
 * The trade tool's tab, order type and denoms all live in the URL. On a
 * statically optimised page `router.query` is empty until the router is
 * ready, so rendering earlier reads the defaults: `tab` falls back to swap,
 * SwapTool mounts and clears `type`, and a `type=limit` deep link is lost.
 *
 * Readiness also waits for `useIsClient` rather than using `isReady`
 * directly: a page without query params can be ready on the first browser
 * render but never during static rendering, and rendering the tool on that
 * first render would not match the server markup.
 */
export const TradeTool: FunctionComponent<PropsWithChildren<TradeToolProps>> = (
  props
) => {
  const { isReady } = useRouter();
  const isClient = useIsClient();

  if (!isReady || !isClient) return null;

  return <TradeToolContent {...props} />;
};

const TradeToolContent: FunctionComponent<PropsWithChildren<TradeToolProps>> = (
  props
) => {
  const {
    swapToolProps,
    previousTrade,
    setPreviousTrade,
    bookLayout,
    orderbookPool,
    limitOnly = false,
    showOrderHistoryLink = true,
    belowWidget,
    aboveWidget,
    children,
  } = props;
  const { t } = useTranslation();
  const [tabParam, setTab] = useQueryState(
    "tab",
    parseAsStringEnum<SwapToolTab>(Object.values(SwapToolTab)).withDefault(
      SwapToolTab.SWAP
    )
  );
  const allowedTabs = orderbookPool ? ORDERBOOK_POOL_TABS : undefined;
  const tab =
    allowedTabs && !allowedTabs.includes(tabParam) ? allowedTabs[0] : tabParam;

  // Kill switch for limit orders: hides the Market/Limit toggle so Buy and
  // Sell only place market orders (PlaceLimitTool forces the type too).
  // Waits for LaunchDarkly to initialise so the toggle doesn't flicker and
  // an outage leaves limit orders available.
  const featureFlags = useFeatureFlags();
  const limitOrdersDisabled =
    featureFlags._isInitialized && !featureFlags.limitOrders;

  // On an orderbook pool page, write Buy and a limit order into the URL when
  // they are missing: the limit tool reads them from there.
  const [typeParam, setTypeParam] = useQueryState("type");
  useEffect(() => {
    if (!orderbookPool) return;
    const fixTab = tab !== tabParam;
    const fixType = limitOnly
      ? typeParam !== "limit" && !limitOrdersDisabled
      : !typeParam;
    if (!fixTab && !fixType) return;
    return deferQueryCorrection(() => {
      if (fixTab) setTab(tab);
      if (fixType) setTypeParam("limit");
    });
  }, [
    orderbookPool,
    limitOnly,
    limitOrdersDisabled,
    tab,
    tabParam,
    typeParam,
    setTab,
    setTypeParam,
  ]);

  // With the toggle hidden, a stale `type=limit` in the URL can't be
  // cleared by the user, and readers of the param other than PlaceLimitTool
  // (e.g. the quote selector) would still act on it. Correct the URL so
  // every reader agrees on a market order.
  const [type, setType] = useQueryState(
    "type",
    parseAsStringLiteral(TRADE_TYPES).withDefault("market")
  );
  useEffect(() => {
    if (limitOrdersDisabled && type === "limit") {
      return deferQueryCorrection(() => setType("market"));
    }
  }, [limitOrdersDisabled, type, setType]);

  const { isWalletConnected } = useWallet();

  const { expanded, expandedParam, isExpandable, setExpanded } =
    useTradeViewExpanded();
  // Swap has no expanded view: the expand control is Buy and Sell only.
  const canExpand =
    bookLayout === "expandable" && isExpandable && tab !== SwapToolTab.SWAP;
  const isBookBeside = Boolean(orderbookPool) || (canExpand && expanded);
  // Switching to Swap, or a link that opens Swap expanded, collapses the
  // view, so the page's wide layout never shows around the plain widget.
  // Cleared in the same URL update as the tab change, so the page never
  // renders a frame with the two out of step.
  const selectTab = (next: SwapToolTab) => {
    if (next === SwapToolTab.SWAP && expandedParam) void setExpanded(null);
    void setTab(next);
  };
  useEffect(() => {
    if (
      bookLayout === "expandable" &&
      tab === SwapToolTab.SWAP &&
      expandedParam
    )
      void setExpanded(null);
  }, [bookLayout, tab, expandedParam, setExpanded]);

  // The book beside the widget matches the widget card's rendered height,
  // so they stay aligned whatever the widget shows; it scrolls inside.
  // Measured whether or not the book is beside the widget, so the height is
  // already known on the first frame of an expand.
  const [setCardElement, cardHeight] = useMeasuredHeight();
  // Whatever sits above the widget in its column (the trade page's banner),
  // so the cards beside the column span it as well.
  const [setAboveElement, aboveHeight] = useMeasuredHeight();

  // The pair the active widget has selected, reported by the widget itself
  // so it is right whether or not the widget keeps its pair in the URL.
  // Tagged with the tab so a previous tab's pair is never shown while the
  // new widget mounts.
  const [selectedPair, setSelectedPair] = useState<{
    tab: SwapToolTab;
    base: string;
    quote: string;
  }>();
  const pair = orderbookPool
    ? {
        base: orderbookPool.baseDenom,
        quote: orderbookPool.quoteDenom,
        poolId: orderbookPool.poolId,
      }
    : selectedPair?.tab === tab
      ? { base: selectedPair.base, quote: selectedPair.quote }
      : { base: undefined, quote: undefined };
  // Price picked by clicking a book row, filled into the limit price only
  // while the widget is still on that book's pair.
  const { externalOrderPrice, selectBookPrice } = useBookPriceSelection(pair);

  // Whether the pair has a book, known before the book panel loads, so the
  // book's slot is laid out from the first frame of an expand.
  const { orderbook: pairOrderbook, isLoading: isOrderbooksLoading } =
    useCanonicalOrderbookForPair({
      coinMinimalDenomA: pair.base,
      coinMinimalDenomB: pair.quote,
      poolId: orderbookPool?.poolId,
    });

  // Fetch the panels' code ahead of the first expand, so their content
  // arrives without waiting on it.
  useEffect(() => {
    if (bookLayout === "expandable" && isExpandable)
      void import("~/components/trade-view/panels");
  }, [bookLayout, isExpandable]);

  const limitToolPairProps = orderbookPool
    ? {
        initialBaseDenom: orderbookPool.baseDenom,
        initialQuoteDenom: orderbookPool.quoteDenom,
        lockPair: true,
        alwaysExpandedDetails: true,
        limitOnly,
      }
    : {
        initialBaseDenom: previousTrade?.baseDenom,
        initialQuoteDenom: previousTrade?.quoteDenom,
      };

  const widget = (
    <div className="flex flex-col gap-3">
      <div
        ref={setCardElement}
        className="relative flex flex-col gap-3 rounded-3xl bg-osmoverse-900 px-5 pt-5 pb-3 sm:px-4 sm:pt-4 sm:pb-2"
      >
        <div className="flex w-full items-center justify-between md:gap-2">
          <SwapToolTabs
            activeTab={tab}
            setTab={selectTab}
            allowedTabs={allowedTabs}
          />
          <div className="flex items-center gap-2">
            {tab !== SwapToolTab.SWAP && !limitOrdersDisabled && !limitOnly && (
              <OrderTypeSelector
                initialBaseDenom={limitToolPairProps.initialBaseDenom}
                initialQuoteDenom={limitToolPairProps.initialQuoteDenom}
              />
            )}
            {canExpand && (
              <button
                type="button"
                onClick={() => setExpanded(!expanded)}
                aria-label={
                  expanded ? t("tradeView.collapse") : t("tradeView.expand")
                }
                aria-pressed={expanded}
                title={
                  expanded ? t("tradeView.collapse") : t("tradeView.expand")
                }
                className="flex h-8 w-8 items-center justify-center rounded-full text-osmoverse-300 transition-colors hover:bg-osmoverse-800 hover:text-osmoverse-100"
              >
                <Icon
                  id={expanded ? "resize-minimize" : "resize-expand"}
                  width={16}
                  height={16}
                />
              </button>
            )}
          </div>
        </div>
        {useMemo(() => {
          switch (tab) {
            case SwapToolTab.BUY:
              return (
                <PlaceLimitTool
                  key="tool-buy"
                  {...limitToolPairProps}
                  externalOrderPrice={externalOrderPrice}
                  onPairChange={(p) =>
                    setSelectedPair({ ...p, tab: SwapToolTab.BUY })
                  }
                  onOrderSuccess={(baseDenom, quoteDenom) => {
                    setPreviousTrade({
                      sendTokenDenom: quoteDenom ?? "",
                      outTokenDenom: baseDenom ?? "",
                      baseDenom: baseDenom ?? "",
                      quoteDenom: quoteDenom ?? "",
                    });
                  }}
                />
              );
            case SwapToolTab.SELL:
              return (
                <PlaceLimitTool
                  key="tool-sell"
                  {...limitToolPairProps}
                  externalOrderPrice={externalOrderPrice}
                  onPairChange={(p) =>
                    setSelectedPair({ ...p, tab: SwapToolTab.SELL })
                  }
                  onOrderSuccess={(baseDenom, quoteDenom) => {
                    setPreviousTrade({
                      sendTokenDenom: baseDenom ?? "",
                      outTokenDenom: quoteDenom ?? "",
                      baseDenom: baseDenom ?? "",
                      quoteDenom: quoteDenom ?? "",
                    });
                  }}
                />
              );
            case SwapToolTab.SWAP:
            default:
              return (
                <SwapTool
                  useOtherCurrencies
                  useQueryParams
                  onSwapSuccess={({ sendTokenDenom, outTokenDenom }) => {
                    setPreviousTrade({
                      sendTokenDenom,
                      outTokenDenom,
                      baseDenom: previousTrade?.baseDenom ?? "",
                      quoteDenom: previousTrade?.quoteDenom ?? "",
                    });
                  }}
                  initialSendTokenDenom={previousTrade?.sendTokenDenom}
                  initialOutTokenDenom={previousTrade?.outTokenDenom}
                  {...swapToolProps}
                  onPairChange={(p) =>
                    setSelectedPair({ ...p, tab: SwapToolTab.SWAP })
                  }
                />
              );
          }
          // eslint-disable-next-line react-hooks/exhaustive-deps
        }, [
          swapToolProps,
          tab,
          previousTrade,
          setPreviousTrade,
          orderbookPool?.poolId,
          externalOrderPrice,
        ])}
      </div>

      {bookLayout === "below" && (
        <TradeViewBook
          base={pair.base}
          quote={pair.quote}
          onPriceSelect={selectBookPrice}
          className="h-[520px]"
        />
      )}

      {children}

      {showOrderHistoryLink && isWalletConnected && (
        <Link
          href="/transactions?tab=orders&fromPage=swap"
          className="flex items-center justify-between rounded-2xl border border-solid border-osmoverse-800/50 bg-osmoverse-1000 py-2 px-4 hover:bg-osmoverse-850"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center">
              <Icon
                id="history-uncolored"
                width={24}
                height={24}
                className="text-osmoverse-400"
              />
            </div>
            <span className="subtitle1 text-osmoverse-300">
              {t("limitOrders.orderHistory")}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center">
              <Icon
                id="chevron-right"
                width={7}
                height={12}
                className="text-osmoverse-400"
              />
            </div>
          </div>
        </Link>
      )}
    </div>
  );

  // The expanded view shows the base asset's price chart, the same chart as
  // the orderbook pool page.
  const showChart = isBookBeside && !orderbookPool;
  // The book's slot is kept while the orderbook list loads, so a pair that
  // has a book doesn't shift the row when the list arrives.
  const showBook =
    isBookBeside && (Boolean(pairOrderbook) || isOrderbooksLoading);

  // The expanded trade page (not an orderbook pool's page) puts the chart
  // above the widget and book, and the widget in a centred column with the
  // book on its right, so switching between Buy and Sell never moves it.
  const isTradeView = isBookBeside && !orderbookPool;

  // Below 1024px the book stacks under the widget at a fixed height.
  const { isMobile: isStacked } = useWindowSize(Breakpoint.lg);
  // The cards beside the widget's column run from the top of what is above
  // the widget (plus the column's 16px gap) to the bottom of the widget card.
  const sideHeight =
    isBookBeside && !isStacked && cardHeight
      ? {
          height:
            cardHeight + (aboveWidget && aboveHeight ? aboveHeight + 16 : 0),
        }
      : undefined;

  // The widget keeps the same position in the tree in every layout (the
  // chart, book and orders are empty slots when not shown), so expanding,
  // collapsing or switching tabs never remounts it and the form keeps what
  // the user typed.
  return (
    <div
      className={classNames({
        "flex flex-col gap-4": isBookBeside,
        "w-full min-w-0": isTradeView,
      })}
    >
      <div
        className={classNames({
          // Widget in the middle column, book on its right. The page pads
          // the expanded view clear of the sidebar, which would put the
          // middle half a sidebar right of where the collapsed widget sits;
          // an empty last column of the sidebar's width (less one gap)
          // cancels that, so expanding moves the widget down, not sideways.
          // The book keeps at least 360px, so a narrow window moves the
          // widget left rather than squeezing the book. At 1280px and
          // narrower the page sits beside the sidebar instead of padding
          // past it, so there is nothing to cancel, and the book may go to
          // 340px so the view still fits down to 1153px.
          "grid grid-cols-[minmax(0,1fr)_512px_minmax(360px,1fr)_calc(theme(spacing.sidebar)-1rem)] items-start gap-4 xl:grid-cols-[minmax(0,1fr)_512px_minmax(340px,1fr)] lg:grid-cols-1":
            isTradeView,
          "flex items-start gap-4 lg:flex-col": isBookBeside && !isTradeView,
        })}
      >
        {/* The chart and book slots are sized here, outside their lazily
            loaded panels, so the layout is final on the first frame of an
            expand and the panels fill their cards in place. The chart
            spans the widget and book columns, as wide as the two together
            (512px + gap + the book's 420px at most), whether or not this
            pair has a book. */}
        {showChart && (
          <div className="col-span-2 col-start-2 h-[420px] w-full min-w-0 max-w-[948px] overflow-hidden rounded-3xl bg-osmoverse-900 lg:col-span-1 lg:col-start-auto lg:max-w-none">
            <TradeViewChart base={pair.base} className="h-full w-full" />
          </div>
        )}
        {/* What the page shows above and under the widget sits in the
            widget's column, so it stays with the widget in every layout. */}
        <div
          className={classNames("flex flex-col", {
            "col-start-2 lg:col-start-auto": isTradeView,
            "w-[512px] shrink-0 lg:w-full": isBookBeside && !isTradeView,
          })}
        >
          {aboveWidget && (
            // Spaced from the widget only when it has height: content such
            // as a banner with nothing to show can render an empty element.
            <div className={classNames({ "mb-4": aboveHeight })}>
              <div ref={setAboveElement}>{aboveWidget}</div>
            </div>
          )}
          <div className="flex flex-col gap-4">
            {widget}
            {belowWidget}
          </div>
        </div>
        {showBook && (
          <div
            style={sideHeight}
            className={classNames(
              "overflow-hidden rounded-3xl bg-osmoverse-900",
              orderbookPool
                ? "min-w-0 flex-1 lg:w-full"
                : "w-full max-w-[420px] lg:max-w-none",
              { "h-[520px]": !sideHeight }
            )}
          >
            <TradeViewBook
              {...pair}
              hideOpenOrderbookLink={Boolean(orderbookPool)}
              onPriceSelect={selectBookPrice}
              className="h-full w-full"
            />
          </div>
        )}
      </div>
      {/* Only the orderbook pool page lists the user's orders here; the
          expanded trade view links to order history instead. */}
      {orderbookPool && <TradeViewOrders {...pair} />}
    </div>
  );
};
