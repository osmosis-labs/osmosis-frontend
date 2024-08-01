import { PricePretty } from "@keplr-wallet/unit";
import { RatePretty } from "@keplr-wallet/unit";
import { FunctionComponent } from "react";

import { PriceChange } from "~/components/assets/price";

export const PortfolioPerformance: FunctionComponent<{
  selectedDifference: PricePretty;
  selectedPercentage: RatePretty;
  formattedDate?: string;
}> = ({ selectedDifference, selectedPercentage, formattedDate }) => {
  return (
    <div className="body1 md:caption flex text-bullish-400">
      <PriceChange
        className="ml-2"
        priceChange={selectedPercentage}
        value={selectedDifference}
      />
      {formattedDate && (
        <span className="ml-2 text-osmoverse-400">{formattedDate}</span>
      )}
    </div>
  );
};
