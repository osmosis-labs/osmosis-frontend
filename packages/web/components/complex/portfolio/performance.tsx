import { PricePretty } from "@osmosis-labs/unit";
import { RatePretty } from "@osmosis-labs/unit";
import { FunctionComponent } from "react";

import { PriceChange } from "~/components/assets/price";
import { useUserSettingsStore } from "~/stores/user-settings-store";

export const PortfolioPerformance: FunctionComponent<{
  selectedDifference: PricePretty;
  selectedPercentage: RatePretty;
  formattedDate?: string;
  showDate: boolean;
}> = ({ selectedDifference, selectedPercentage, formattedDate, showDate }) => {
  const hideBalances = useUserSettingsStore((state) => state.hideBalances);

  return (
    <div className="body1 flex text-bullish-400">
      <PriceChange
        className="ml-2"
        priceChange={selectedPercentage}
        // Dollar change would reveal the portfolio size; keep the percentage only.
        value={hideBalances ? undefined : selectedDifference}
      />
      {showDate && formattedDate && (
        <span className="body1 ml-2 text-osmoverse-400">{formattedDate}</span>
      )}
    </div>
  );
};
