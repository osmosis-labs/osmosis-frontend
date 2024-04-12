import { RatePretty } from "@keplr-wallet/unit";
import classNames from "classnames";
import { FunctionComponent } from "react";

import { Icon } from "~/components/assets/icon";

export const PriceChange: FunctionComponent<{
  priceChange: RatePretty;
  overrideTextClasses?: string;
}> = ({ priceChange, overrideTextClasses = "caption" }) => {
  const isBullish = priceChange.toDec().isPositive();
  const isBearish = priceChange.toDec().isNegative();
  const isFlat = !isBullish && !isBearish;

  // remove negative symbol since we're using arrows
  if (isBearish) priceChange = priceChange.mul(new RatePretty(-1));

  return (
    <div className="flex items-center gap-1">
      {isBullish && (
        <Icon
          className="text-bullish-400"
          id="bullish-arrow"
          height={9}
          width={9}
        />
      )}
      {isBearish && (
        <Icon
          className="text-ammelia-400"
          id="bearish-arrow"
          height={9}
          width={9}
        />
      )}
      <span
        className={classNames(
          {
            "text-bullish-400": isBullish,
            "text-ammelia-400": isBearish,
            "text-wosmongton-200": isFlat,
          },
          overrideTextClasses
        )}
      >
        {isFlat
          ? "-"
          : priceChange.maxDecimals(2).inequalitySymbol(false).toString()}
      </span>
    </div>
  );
};
