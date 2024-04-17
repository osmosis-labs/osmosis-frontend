import { RatePretty } from "@keplr-wallet/unit";
import classNames from "classnames";
import { FunctionComponent } from "react";

import { Icon } from "~/components/assets/icon";

export const PriceChange: FunctionComponent<{
  priceChange: RatePretty;
  overrideTextClasses?: string;
}> = ({ priceChange, overrideTextClasses = "body1" }) => {
  const isBullish = priceChange.toDec().isPositive();
  const isBearish = priceChange.toDec().isNegative();
  const isFlat = !isBullish && !isBearish;

  // remove negative symbol since we're using arrows
  if (isBearish) priceChange = priceChange.mul(new RatePretty(-1));

  return (
    <div className="flex items-center gap-1">
      {isBullish && (
        <Icon
          id="triangle-down"
          className="mb-1 rotate-180 transform text-bullish-400"
          height={10}
          width={10}
        />
      )}
      {isBearish && (
        <Icon
          id="triangle-down"
          className="mt-1 text-rust-400"
          height={10}
          width={10}
        />
      )}
      <div
        className={classNames(
          {
            "text-bullish-400": isBullish,
            "text-rust-400": isBearish,
            "text-wosmongton-200": isFlat,
          },
          overrideTextClasses
        )}
      >
        {isFlat
          ? "-"
          : priceChange.maxDecimals(2).inequalitySymbol(false).toString()}
      </div>
    </div>
  );
};
