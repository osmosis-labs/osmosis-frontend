import { CoinPretty, Dec } from "@keplr-wallet/unit";
import { observer } from "mobx-react-lite";
import React, { FunctionComponent } from "react";
import { useTranslation } from "react-multi-lang";

import { useStore } from "~/stores";

import { OsmoverseCard } from "./osmoverse-card";

export const EstimatedEarningCard: FunctionComponent<{
  stakeAmount: CoinPretty;
}> = observer(({}) => {
  const t = useTranslation();
  const { queriesStore, chainStore, priceStore } = useStore();

  const osmosisChainId = chainStore.osmosis.chainId;

  const osmo = chainStore.osmosis.stakeCurrency;
  const amount = new CoinPretty(osmo, 1000000000);

  const cosmosQueries = queriesStore.get(osmosisChainId).cosmos;

  // staking APR, despite the name.
  const inflation = cosmosQueries.queryInflation.inflation.toDec();

  const calculatedInflationAmountPerYear = amount
    .toDec()
    .mul(inflation.quo(new Dec(100)));

  const perDayCalculation = calculatedInflationAmountPerYear.quo(new Dec(365));
  const perMonthCalculation = calculatedInflationAmountPerYear.quo(new Dec(12));

  const prettifiedDailyAmount = new CoinPretty(
    osmo,
    perDayCalculation
  ).moveDecimalPointRight(osmo.coinDecimals);
  const prettifiedMonthlyAmount = new CoinPretty(
    osmo,
    perMonthCalculation
  ).moveDecimalPointRight(osmo.coinDecimals);

  const calculatedDailyPrice = priceStore.calculatePrice(prettifiedDailyAmount);
  const calculatedMonthlyPrice = priceStore.calculatePrice(
    prettifiedMonthlyAmount
  );

  return (
    <OsmoverseCard containerClasses="bg-opacity-50">
      <div className="flex flex-col gap-2 text-left">
        <span className="caption text-sm text-osmoverse-200 md:text-xs">
          {t("stake.estimatedEarnings")}
        </span>
        <div className="mt-5 mb-2 flex items-center justify-around">
          <span className="caption text-sm text-osmoverse-200 md:text-xs">
            {calculatedDailyPrice?.toString()}/day
          </span>
          <span className="caption text-sm text-osmoverse-200 md:text-xs">
            {calculatedMonthlyPrice?.toString()}/month
          </span>
        </div>
      </div>
    </OsmoverseCard>
  );
});
