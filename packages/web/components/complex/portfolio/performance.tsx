import { PricePretty } from "@keplr-wallet/unit";
import { RatePretty } from "@keplr-wallet/unit";
import { FunctionComponent } from "react";

import { PriceChange } from "~/components/assets/price";

export const PortfolioPerformance: FunctionComponent<{
  value: PricePretty;
  percentage: RatePretty;
  date?: string;
}> = ({ value, percentage, date }) => {
  return (
    <div className="body1 md:caption flex text-bullish-400">
      <PriceChange className="ml-2" priceChange={percentage} value={value} />
      <span className="ml-2 text-osmoverse-400">{date}</span>
    </div>
  );
};
