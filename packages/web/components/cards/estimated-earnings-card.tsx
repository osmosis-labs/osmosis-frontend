import { CoinPretty, Dec } from "@keplr-wallet/unit";
import { observer } from "mobx-react-lite";
import React, { FunctionComponent } from "react";

import { Icon } from "~/components/assets";
import { OsmoverseCard } from "~/components/cards/osmoverse-card";
import { Tooltip } from "~/components/tooltip";
import { useTranslation } from "~/hooks";
import { useStore } from "~/stores";
import { formatPretty } from "~/utils/formatter";

const PriceCaption: FunctionComponent<{
  price: string | undefined;
  term: string;
  osmoPrice: string | undefined;
}> = ({ price, term, osmoPrice }) => (
  <span className="caption flex flex-grow flex-col overflow-hidden text-sm text-osmoverse-200 md:text-xs">
    <div>
      <span className="truncate text-base text-white-full">{price}</span>&nbsp;/
      {term}
    </div>
    <div className="mt-2 text-xs">
      <span className="truncate">{osmoPrice || "0 OSMO"}</span>/{term}
    </div>
  </span>
);

export const EstimatedEarningCard: FunctionComponent<{
  stakeAmount: CoinPretty | undefined;
  stakingAPR: Dec;
}> = observer(({ stakeAmount, stakingAPR }) => {
  const { t } = useTranslation();
  const { chainStore, priceStore } = useStore();

  const osmo = chainStore.osmosis.stakeCurrency;

  const calculatedInflationAmountPerYear = stakeAmount
    ?.moveDecimalPointRight(osmo.coinDecimals)
    .toDec()
    .mul(stakingAPR.quo(new Dec(100)));

  const perDayCalculation = calculatedInflationAmountPerYear?.quo(new Dec(365));
  const perMonthCalculation = calculatedInflationAmountPerYear?.quo(
    new Dec(12)
  );

  const prettifiedDailyAmount = new CoinPretty(
    osmo,
    perDayCalculation || new Dec(0)
  ).moveDecimalPointRight(osmo.coinDecimals);

  const prettifiedMonthlyAmount = new CoinPretty(
    osmo,
    perMonthCalculation || new Dec(0)
  ).moveDecimalPointRight(osmo.coinDecimals);

  const calculatedDailyPrice = prettifiedDailyAmount
    ? priceStore.calculatePrice(prettifiedDailyAmount)
    : 0;
  const calculatedMonthlyPrice = prettifiedMonthlyAmount
    ? priceStore.calculatePrice(prettifiedMonthlyAmount)
    : 0;

  return (
    <OsmoverseCard containerClasses="bg-opacity-50">
      <div className="flex flex-col gap-2 text-left">
        <span className="caption flex gap-2 text-sm text-osmoverse-200 md:text-xs">
          {t("stake.estimatedEarnings")}
          <Tooltip content={t("stake.estimatedEarningsTooltip")}>
            <Icon id="info" height="14px" width="14px" fill="#958FC0" />
          </Tooltip>
        </span>
        <div className="mt-5 mb-2 flex items-center gap-2">
          <PriceCaption
            price={calculatedDailyPrice?.toString()}
            term={t("stake.day")}
            osmoPrice={formatPretty(prettifiedDailyAmount, {
              maxDecimals: 2,
            })?.toString()}
          />
          <PriceCaption
            price={calculatedMonthlyPrice?.toString()}
            term={t("stake.month")}
            osmoPrice={formatPretty(prettifiedMonthlyAmount, {
              maxDecimals: 2,
            })?.toString()}
          />
        </div>
      </div>
    </OsmoverseCard>
  );
});
