import { Dec } from "@keplr-wallet/unit";
import { observer } from "mobx-react-lite";
import { useMemo } from "react";

import { ChartUnavailable, PriceChartHeader } from "~/components/chart";
import { HistoricalPriceChartV2 } from "~/components/chart/price-historical-v2";
import { Spinner } from "~/components/loaders";
import { useAssetInfoView } from "~/hooks/use-asset-info-view";
import { getPriceExtendedFormatOptions } from "~/utils/formatter";
import { getDecimalCount } from "~/utils/number";
import { api } from "~/utils/trpc";

export const TokenChart = () => {
  const { assetInfoConfig } = useAssetInfoView();

  return (
    <section className="flex flex-col justify-between gap-3 overflow-hidden rounded-5xl pb-8 md:pb-6">
      <div className="p-8 pb-0 md:p-6">
        <TokenChartHeader />
      </div>

      <div className="h-[370px] w-full xl:h-[250px]">
        {assetInfoConfig.isHistoricalDataLoading ? (
          <div className="flex h-full flex-col items-center justify-center">
            <Spinner />
          </div>
        ) : !assetInfoConfig.historicalChartUnavailable ? (
          <>
            <HistoricalPriceChartV2
              data={assetInfoConfig.historicalChartData}
              onPointerHover={assetInfoConfig.setHoverPrice}
              onPointerOut={() => {
                assetInfoConfig.setHoverPrice(0, undefined);
              }}
            />
          </>
        ) : (
          <ChartUnavailable />
        )}
      </div>
    </section>
  );
};

export const TokenChartHeader = observer(() => {
  const { assetInfoConfig } = useAssetInfoView();

  const { data: assetPrice, isLoading } =
    api.edge.assets.getAssetPrice.useQuery(
      {
        coinMinimalDenom: assetInfoConfig.coinMinimalDenom!,
      },
      {
        enabled: assetInfoConfig.coinMinimalDenom !== undefined,
      }
    );

  const hoverPrice = useMemo(() => {
    let price = new Dec(0);
    const decHoverPrice = assetInfoConfig.hoverPrice?.toDec();

    if (decHoverPrice && !decHoverPrice.isZero()) {
      price = decHoverPrice;
    } else if (assetPrice) {
      price = assetPrice.toDec();
    }

    return Number(price.toString());
  }, [assetInfoConfig.hoverPrice, assetPrice]);

  const fiatSymbol =
    assetInfoConfig.hoverPrice?.fiatCurrency?.symbol ??
    assetPrice?.fiatCurrency.symbol;

  const minimumDecimals = 2;
  const maxDecimals = Math.max(getDecimalCount(hoverPrice), minimumDecimals);

  const formatOpts = useMemo(
    () => getPriceExtendedFormatOptions(new Dec(hoverPrice)),
    [hoverPrice]
  );

  return (
    <header>
      <PriceChartHeader
        isLoading={isLoading}
        formatOpts={formatOpts}
        decimal={maxDecimals}
        showAllRange
        hoverPrice={hoverPrice}
        hoverDate={assetInfoConfig.hoverDate}
        historicalRange={assetInfoConfig.historicalRange}
        setHistoricalRange={assetInfoConfig.setHistoricalRange}
        fiatSymbol={fiatSymbol}
        classes={{
          priceHeaderClass: "!text-h2 !font-h2 sm:!text-h4",
        }}
        compactZeros
      />
    </header>
  );
});
