import classNames from "classnames";
import { FunctionComponent, useMemo } from "react";

export enum SwapToolTab {
  SWAP = 0,
  BUY = 1,
  SELL = 2,
}

export interface SwapToolTabsProps {
  setTab: (tab: SwapToolTab) => void;
  activeTab: SwapToolTab;
}

const tabs = [
  {
    label: "Buy",
    value: SwapToolTab.BUY,
  },
  {
    label: "Sell",
    value: SwapToolTab.SELL,
  },
  {
    label: "Swap",
    value: SwapToolTab.SWAP,
  },
];

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
  // Renders each tab as a button, providing a highlight on the current `activeTab`
  const Tabs = useMemo(() => {
    return tabs.map((tab) => {
      const isActive = activeTab === tab.value;
      return (
        <button
          key={`swap-tab-${tab.value}`}
          onClick={() => setTab(tab.value)}
          className={classNames(
            "text-subtitle6 justify-center rounded-[16px] border-2 py-[12px] text-center font-subtitle1 transition-all duration-75",
            {
              "border-bullish-600 bg-osmoverse-850 text-bullish-300": isActive,
              "border-osmoverse-900 text-osmoverse-400": !isActive,
            }
          )}
        >
          {tab.label}
        </button>
      );
    });
  }, [setTab, activeTab]);

  return (
    <div className="grid grid-cols-3 rounded-[16px] bg-osmoverse-900 transition-opacity">
      {Tabs}
    </div>
  );
};
