import classNames from "classnames";
import { FunctionComponent } from "react";

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
  return (
    <div className="flex w-max items-center rounded-3xl border border-osmoverse-700">
      {tabs.map((tab) => {
        const isActive = activeTab === tab.value;
        return (
          <button
            key={`swap-tab-${tab.value}`}
            onClick={() => setTab(tab.value)}
            className={classNames("rounded-3xl px-4 py-3", {
              "bg-osmoverse-700": isActive,
            })}
          >
            <p className="font-medium font-h1">{tab.label}</p>
          </button>
        );
      })}
    </div>
  );
};
