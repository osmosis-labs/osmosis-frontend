import classNames from "classnames";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useRouter } from "next/router";
import { parseAsStringEnum, parseAsStringLiteral, useQueryState } from "nuqs";
import {
  FunctionComponent,
  PropsWithChildren,
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
   * widget and the user's orders below; "below" always shows the book under
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

  const { expanded, isExpandable, setExpanded } = useTradeViewExpanded();
  const isBookBeside =
    Boolean(orderbookPool) || (bookLayout === "expandable" && expanded);

  // The book beside the widget matches the widget card's rendered height,
  // so they stay aligned whatever the widget shows; it scrolls inside.
  const [cardElement, setCardElement] = useState<HTMLDivElement | null>(null);
  const [cardHeight, setCardHeight] = useState<number>();
  useEffect(() => {
    if (!cardElement || !isBookBeside || typeof ResizeObserver === "undefined")
      return;
    const observer = new ResizeObserver(([entry]) =>
      setCardHeight(
        entry.borderBoxSize?.[0]?.blockSize ?? entry.contentRect.height
      )
    );
    observer.observe(cardElement);
    return () => observer.disconnect();
  }, [cardElement, isBookBeside]);

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
            setTab={setTab}
            allowedTabs={allowedTabs}
          />
          <div className="flex items-center gap-2">
            {tab !== SwapToolTab.SWAP && !limitOrdersDisabled && !limitOnly && (
              <OrderTypeSelector
                initialBaseDenom={limitToolPairProps.initialBaseDenom}
                initialQuoteDenom={limitToolPairProps.initialQuoteDenom}
              />
            )}
            {bookLayout === "expandable" && isExpandable && (
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

  // Expanded Buy and Sell also show the base asset's price chart, the same
  // chart as the orderbook pool page; Swap shows widget and book only.
  const showChart = isBookBeside && !orderbookPool && tab !== SwapToolTab.SWAP;

  // Below 1024px the book stacks under the widget at a fixed height. At
  // 1536px and below the chart takes its own row above widget and book.
  const { isMobile: isStacked } = useWindowSize(Breakpoint.lg);
  const { isMobile: isChartOnOwnRow } = useWindowSize(Breakpoint.xxl);
  const sideHeight =
    isBookBeside && !isStacked && cardHeight
      ? { height: cardHeight }
      : undefined;
  const chartHeight = !isChartOnOwnRow ? sideHeight : undefined;

  // The widget keeps the same position in the tree in every layout (the
  // chart, book and orders are empty slots when not shown), so expanding,
  // collapsing or switching tabs never remounts it and the form keeps what
  // the user typed.
  return (
    <div
      className={classNames({
        "flex flex-col gap-4": isBookBeside,
        // Without the chart the row is only as wide as widget and book.
        "mx-auto w-fit max-w-full":
          isBookBeside && !orderbookPool && !showChart,
        "w-full min-w-0": showChart,
      })}
    >
      <div
        className={classNames({
          "flex items-start gap-4 lg:flex-col": isBookBeside,
          "2xl:flex-wrap": showChart,
        })}
      >
        {showChart && (
          <TradeViewChart
            base={pair.base}
            style={chartHeight}
            className={classNames("min-w-0 flex-1 2xl:basis-full", {
              "h-[420px]": !chartHeight,
            })}
          />
        )}
        <div
          className={classNames({
            "w-[512px] shrink-0 lg:w-full": isBookBeside,
          })}
        >
          {widget}
        </div>
        {isBookBeside && (
          <TradeViewBook
            {...pair}
            hideOpenOrderbookLink={Boolean(orderbookPool)}
            onPriceSelect={selectBookPrice}
            style={sideHeight}
            className={classNames(
              orderbookPool || showChart
                ? "min-w-0 flex-1 lg:w-full"
                : "w-[420px] shrink-0 lg:w-full",
              { "max-w-[420px] 2xl:max-w-none": showChart },
              { "h-[520px]": !sideHeight }
            )}
          />
        )}
      </div>
      {isBookBeside && <TradeViewOrders {...pair} />}
    </div>
  );
};
