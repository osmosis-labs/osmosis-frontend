import classNames from "classnames";
import { FunctionComponent, useMemo } from "react";

import { useTranslation } from "~/hooks";
import { theme } from "~/tailwind.config";

export enum SwapToolTab {
  SWAP = "swap",
  BUY = "buy",
  SELL = "sell",
}

export interface SwapToolTabsProps {
  setTab: (tab: SwapToolTab) => void;
  activeTab: SwapToolTab;
}

/**
 * Component for swapping between tabs on the swap modal.
 * Has three tabs:
 * - Buy
 * - Sell
 * - Swap
 */
export const SwapToolTabs: FunctionComponent<SwapToolTabsProps> = ({
  setTab,
  activeTab,
}) => {
  const { t } = useTranslation();

  const tabs = useMemo(
    () => [
      {
        label: t("portfolio.buy"),
        value: SwapToolTab.BUY,
        color: theme.colors.bullish[400],
      },
      {
        label: t("limitOrders.sell"),
        value: SwapToolTab.SELL,
        color: theme.colors.rust[400],
      },
      {
        label: t("swap.title"),
        value: SwapToolTab.SWAP,
        color: theme.colors.wosmongton[300],
      },
    ],
    [t]
  );

  return (
    <div className="flex w-max items-center rounded-3xl border border-osmoverse-700">
      {tabs.map((tab) => {
        const isActive = activeTab === tab.value;
        return (
          <button
            key={`swap-tab-${tab.value}`}
            onClick={() => setTab(tab.value)}
            className={classNames("rounded-3xl px-4 py-3 transition-colors", {
              "hover:bg-osmoverse-850": !isActive,
            })}
            style={{
              backgroundColor: isActive ? tab.color : undefined,
            }}
          >
            <p
              className={classNames("font-semibold", {
                "text-wosmongton-100": !isActive,
                "text-osmoverse-900": isActive,
              })}
            >
              {tab.label}
            </p>
          </button>
        );
      })}
    </div>
  );
};
