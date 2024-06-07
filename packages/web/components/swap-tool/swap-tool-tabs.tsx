import classNames from "classnames";
import { FunctionComponent } from "react";

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

const tabs = [
  {
    label: "Buy",
    value: SwapToolTab.BUY,
    color: theme.colors.bullish[400],
  },
  {
    label: "Sell",
    value: SwapToolTab.SELL,
    color: theme.colors.rust[400],
  },
  {
    label: "Swap",
    value: SwapToolTab.SWAP,
    color: theme.colors.ammelia[400],
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
  return (
    <div className="flex items-center">
      {tabs.map((tab) => {
        const isActive = activeTab === tab.value;
        return (
          <button
            key={`swap-tab-${tab.value}`}
            onClick={() => setTab(tab.value)}
            className={classNames("px-3 py-2", {
              "!pl-0": tab.value === SwapToolTab.BUY,
              "text-osmoverse-500": !isActive,
            })}
            style={{
              color: isActive ? tab.color : undefined,
            }}
          >
            <h6 className="leading-6">{tab.label}</h6>
          </button>
        );
      })}
    </div>
  );
};
