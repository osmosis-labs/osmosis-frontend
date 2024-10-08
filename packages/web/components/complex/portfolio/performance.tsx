import { PricePretty } from "@keplr-wallet/unit";
import { RatePretty } from "@keplr-wallet/unit";
import { FunctionComponent } from "react";

import { PriceChange } from "~/components/assets/price";

export const PortfolioPerformance: FunctionComponent<{
  selectedDifference: PricePretty;
  selectedPercentage: RatePretty;
  formattedDate?: string;
  showDate: boolean;
}> = ({ selectedDifference, selectedPercentage, formattedDate, showDate }) => {
  return (
    <div className="body1 flex text-bullish-400">
      <PriceChange
        className="ml-2"
        priceChange={selectedPercentage}
        value={selectedDifference}
      />
      {showDate && formattedDate && (
        <span className="body1 ml-2 text-osmoverse-400">{formattedDate}</span>
      )}
    </div>
  );
};
