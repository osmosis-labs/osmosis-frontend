import { observer } from "mobx-react-lite";
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
import { useFeatureFlags, useTranslation } from "~/hooks";
import { PreviousTrade } from "~/pages";
import { useStore } from "~/stores";

interface TradeToolProps {
  swapToolProps?: SwapToolProps;
  previousTrade?: PreviousTrade;
  setPreviousTrade: (trade: PreviousTrade) => void;
}

/**
 * The trade tool's tab, order type and denoms all live in the URL. On a
 * statically optimised page `router.query` is empty until the router is
 * ready, so rendering earlier reads the defaults: `tab` falls back to swap,
 * SwapTool mounts and clears `type`, and a `type=limit` deep link is lost.
 *
 * Readiness goes through state set in an effect rather than `isReady`
 * directly: a page without query params can be ready on the first browser
 * render but never during static rendering, and rendering the tool on that
 * first render would not match the server markup.
 */
export const TradeTool: FunctionComponent<PropsWithChildren<TradeToolProps>> = (
  props
) => {
  const { isReady } = useRouter();
  const [canRender, setCanRender] = useState(false);

  useEffect(() => {
    if (isReady) setCanRender(true);
  }, [isReady]);

  if (!canRender) return null;

  return <TradeToolContent {...props} />;
};

const TradeToolContent: FunctionComponent<PropsWithChildren<TradeToolProps>> =
  observer(({ swapToolProps, previousTrade, setPreviousTrade, children }) => {
    const { t } = useTranslation();
    const [tab, setTab] = useQueryState(
      "tab",
      parseAsStringEnum<SwapToolTab>(Object.values(SwapToolTab)).withDefault(
        SwapToolTab.SWAP
      )
    );

    // Kill switch for limit orders: hides the Market/Limit toggle so Buy and
    // Sell only place market orders (PlaceLimitTool forces the type too).
    // Waits for LaunchDarkly to initialise so the toggle doesn't flicker and
    // an outage leaves limit orders available.
    const featureFlags = useFeatureFlags();
    const limitOrdersDisabled =
      featureFlags._isInitialized && !featureFlags.limitOrders;

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

    const { accountStore } = useStore();
    const wallet = accountStore.getWallet(accountStore.osmosisChainId);

    return (
      <div className="flex flex-col gap-3">
        <div className="relative flex flex-col gap-3 rounded-3xl bg-osmoverse-900 px-5 pt-5 pb-3 sm:px-4 sm:pt-4 sm:pb-2">
          <div className="flex w-full items-center justify-between md:gap-2">
            <SwapToolTabs activeTab={tab} setTab={setTab} />
            <div className="flex items-center gap-2">
              {tab !== SwapToolTab.SWAP && !limitOrdersDisabled && (
                <OrderTypeSelector
                  initialBaseDenom={previousTrade?.baseDenom}
                  initialQuoteDenom={previousTrade?.quoteDenom}
                />
              )}
            </div>
          </div>
          {useMemo(() => {
            switch (tab) {
              case SwapToolTab.BUY:
                return (
                  <PlaceLimitTool
                    key="tool-buy"
                    initialBaseDenom={previousTrade?.baseDenom}
                    initialQuoteDenom={previousTrade?.quoteDenom}
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
                    initialBaseDenom={previousTrade?.baseDenom}
                    initialQuoteDenom={previousTrade?.quoteDenom}
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
                  />
                );
            }
          }, [swapToolProps, tab, previousTrade, setPreviousTrade])}
        </div>

        {children}

        {wallet?.isWalletConnected && (
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
  });
