import classNames from "classnames";
import { FunctionComponent, useMemo } from "react";

import { useTranslation } from "~/hooks";

import { AllocationOptions } from "./types";

interface AllocationTabProps {
  setTab: (tab: AllocationOptions) => void;
  activeTab: AllocationOptions;
}

export const AllocationTabs: FunctionComponent<AllocationTabProps> = ({
  setTab,
  activeTab,
}) => {
  const { t } = useTranslation();

  const tabs = useMemo(
    () =>
      [
        {
          label: t("portfolio.all"),
          value: "all",
        },
        {
          label: t("portfolio.assets"),
          value: "assets",
        },
        {
          label: t("portfolio.available"),
          value: "available",
        },
      ] as { label: string; value: AllocationOptions }[],
    [t]
  );

  return (
    <div className="flex h-8 w-full items-center rounded-3xl border border-osmoverse-700">
      {tabs.map((tab) => {
        const isActive = activeTab === tab.value;
        return (
          <button
            key={`swap-tab-${tab.value}`}
            onClick={() => setTab(tab.value)}
            className={classNames(
              "h-full w-1/3 rounded-3xl transition-colors",
              {
                "hover:bg-osmoverse-850": !isActive,
                "bg-osmoverse-700": isActive,
              }
            )}
          >
            <p
              className={classNames("body2", {
                "text-wosmongton-100": !isActive,
                "text-white": isActive,
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
