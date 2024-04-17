import { RatePretty } from "@keplr-wallet/unit";
import { FunctionComponent } from "react";

import { PriceChange } from "~/components/assets/price-change";
import { theme } from "~/tailwind.config";

export const HistoricalPriceCell: FunctionComponent<{
  priceChange24h?: RatePretty;
}> = ({ priceChange24h }) => {
  const isBullish = priceChange24h && priceChange24h.toDec().isPositive();
  const isBearish = priceChange24h && priceChange24h.toDec().isNegative();

  let color: string;
  if (isBullish) {
    color = theme.colors.bullish[400];
  } else if (isBearish) {
    color = theme.colors.rust[400];
  } else {
    color = theme.colors.wosmongton[200];
  }

  return (
    <div className="flex items-center gap-4">
      {priceChange24h && <PriceChange priceChange={priceChange24h} />}
    </div>
  );
};
