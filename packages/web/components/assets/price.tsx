import { PricePretty, RatePretty } from "@keplr-wallet/unit";
import { CommonPriceChartTimeFrame } from "@osmosis-labs/server";
import classNames from "classnames";
import { FunctionComponent, useMemo } from "react";

import { Icon } from "~/components/assets/icon";
import { useTranslation } from "~/hooks";
import { theme } from "~/tailwind.config";
import { api } from "~/utils/trpc";

import { Sparkline } from "../chart/sparkline";
import { CustomClasses } from "../types";

/** Colored price change text with up/down arrow. */
export const PriceChange: FunctionComponent<
  {
    priceChange: RatePretty;
    overrideTextClasses?: string;
    value?: PricePretty;
  } & CustomClasses
> = ({ priceChange, overrideTextClasses = "body1", className, value }) => {
  const isBullish = priceChange.toDec().isPositive();
  const isBearish = priceChange.toDec().isNegative();
  const isFlat = !isBullish && !isBearish;

  // remove negative symbol since we're using arrows
  if (isBearish) {
    priceChange = priceChange.mul(new RatePretty(-1));
    value = value?.mul(new RatePretty(-1));
  }

  const priceChangeDisplay = priceChange
    .maxDecimals(1)
    .inequalitySymbol(false)
    .toString();

  const formattedPriceChangeDisplay =
    value !== undefined ? `(${priceChangeDisplay})` : priceChangeDisplay;

  return (
    <div className={classNames("flex h-fit items-center gap-1", className)}>
      {isBullish && (
        <Icon
          id="triangle-down"
          className="mb-1 shrink-0 rotate-180 transform text-bullish-400"
          height={10}
          width={10}
        />
      )}
      {isBearish && (
        <Icon
          id="triangle-down"
          className="mt-1 shrink-0 text-rust-400"
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
        {value !== undefined ? value.toString() + " " : null}

        {isFlat ? "-" : formattedPriceChangeDisplay}
      </div>
    </div>
  );
};

/** Historical price sparkline. */
export const HistoricalPriceSparkline: FunctionComponent<{
  coinMinimalDenom: string;
  timeFrame: CommonPriceChartTimeFrame;
  height?: number;
  width?: number;
}> = ({ coinMinimalDenom, timeFrame, height, width }) => {
  const { t } = useTranslation();

  const { data: recentPrices, isLoading } =
    api.edge.assets.getAssetHistoricalPrice.useQuery(
      {
        coinMinimalDenom,
        timeFrame,
      },
      {
        staleTime: 1000 * 30, // 30 secs
        keepPreviousData: true,
      }
    );

  const recentPriceCloses = useMemo(
    () => (recentPrices ? recentPrices.map((p) => p.close) : []),
    [recentPrices]
  );

  const firstPrice = recentPriceCloses.length > 0 ? recentPriceCloses[0] : null;
  const lastPrice =
    recentPriceCloses.length > 0
      ? recentPriceCloses[recentPriceCloses.length - 1]
      : null;
  const isBullish =
    firstPrice !== null && lastPrice !== null && lastPrice > firstPrice;
  const isBearish =
    firstPrice !== null && lastPrice !== null && lastPrice < firstPrice;

  let color: string;
  if (isBullish) {
    color = theme.colors.bullish[400];
  } else if (isBearish) {
    color = theme.colors.rust[400];
  } else {
    color = theme.colors.wosmongton[200];
  }

  // If empty, is likely error state
  return recentPriceCloses.length > 0 ? (
    <Sparkline
      height={height ?? 50}
      width={width ?? 80}
      lineWidth={2}
      data={recentPriceCloses}
      color={color}
    />
  ) : isLoading ? (
    // Placeholder div to take up space for missing data
    <div
      style={{
        width,
        height,
      }}
      className={classNames({ "w-20": !width, "h-[3.125rem]": !height })}
    />
  ) : (
    <div
      style={{
        width,
        height,
      }}
      className={classNames("body1 text-center text-osmoverse-500", {
        "w-20": !width,
        "h-[3.125rem]": !height,
      })}
    >
      {t("errors.noData")}
    </div>
  );
};
