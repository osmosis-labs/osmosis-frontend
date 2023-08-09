import { CoinPretty, Dec } from "@keplr-wallet/unit";
import { observer } from "mobx-react-lite";
import React, { FunctionComponent } from "react";
import { useTranslation } from "react-multi-lang";

import { OsmoverseCard } from "~/components/cards/osmoverse-card";
import { useStore } from "~/stores";

const PriceCaption: FunctionComponent<{
  price: string | undefined;
  term: string;
  osmoPrice: string | undefined;
}> = ({ price, term, osmoPrice }) => (
  <span className="caption flex flex-grow flex-col text-sm text-osmoverse-200 md:text-xs">
    <div>
      <span className="text-base text-white-full">{price}</span>&nbsp;/{term}
    </div>
    <div className="mt-2 text-xs">
      <span>{osmoPrice || "0 OSMO"}</span>/{term}
    </div>
  </span>
);

export const EstimatedEarningCard: FunctionComponent<{
  stakeAmount?: CoinPretty;
}> = observer(({ stakeAmount }) => {
  const t = useTranslation();
  const { queriesStore, chainStore, priceStore } = useStore();

  const osmosisChainId = chainStore.osmosis.chainId;

  const osmo = chainStore.osmosis.stakeCurrency;

  const cosmosQueries = queriesStore.get(osmosisChainId).cosmos;

  // staking APR, despite the name.
  const stakingAPR = cosmosQueries.queryInflation.inflation.toDec();

  const calculatedInflationAmountPerYear = stakeAmount
    ?.toDec()
    .mul(stakingAPR.quo(new Dec(100)));

  const perDayCalculation = calculatedInflationAmountPerYear?.quo(new Dec(365));
  const perMonthCalculation = calculatedInflationAmountPerYear?.quo(
    new Dec(12)
  );

  const prettifiedDailyAmount = perDayCalculation
    ? new CoinPretty(osmo, perDayCalculation).moveDecimalPointRight(
        osmo.coinDecimals
      )
    : "";

  const prettifiedMonthlyAmount = perMonthCalculation
    ? new CoinPretty(osmo, perMonthCalculation).moveDecimalPointRight(
        osmo.coinDecimals
      )
    : "";

  const calculatedDailyPrice = prettifiedDailyAmount
    ? priceStore.calculatePrice(prettifiedDailyAmount)
    : 0;
  const calculatedMonthlyPrice = prettifiedMonthlyAmount
    ? priceStore.calculatePrice(prettifiedMonthlyAmount)
    : 0;

  return (
    <OsmoverseCard containerClasses="bg-opacity-50">
      <div className="flex flex-col gap-2 text-left">
        <span className="caption text-sm text-osmoverse-200 md:text-xs">
          {t("stake.estimatedEarnings")}
        </span>
        <div className="mt-5 mb-2 flex items-center">
          <PriceCaption
            price={calculatedDailyPrice?.toString()}
            term={t("stake.day")}
            osmoPrice={prettifiedDailyAmount?.toString()}
          />
          <PriceCaption
            price={calculatedMonthlyPrice?.toString()}
            term={t("stake.month")}
            osmoPrice={prettifiedMonthlyAmount?.toString()}
          />
        </div>
      </div>
    </OsmoverseCard>
  );
});
