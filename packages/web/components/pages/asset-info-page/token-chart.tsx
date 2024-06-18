import { Dec } from "@keplr-wallet/unit";
import { observer } from "mobx-react-lite";
import { useMemo } from "react";

import { ChartUnavailable } from "~/components/chart";
import {
  HistoricalPriceChartHeaderV2,
  HistoricalPriceChartV2,
} from "~/components/chart/price-historical-v2";
import { Spinner } from "~/components/loaders";
import { ButtonGroup, ButtonGroupItem } from "~/components/ui/button-group";
import { useTranslation } from "~/hooks";
import { useAssetInfoView } from "~/hooks/use-asset-info-view";
import { api } from "~/utils/trpc";

export const TokenChart = () => {
  const { assetInfoConfig } = useAssetInfoView();

  return (
    <section className="relative flex flex-col justify-between gap-3">
      <TokenChartHeader />

      <div className="h-[400px] w-full xl:h-[476px]">
        {assetInfoConfig.isHistoricalDataLoading ? (
          <div className="flex h-full flex-col items-center justify-center">
            <Spinner />
          </div>
        ) : !assetInfoConfig.historicalChartUnavailable ? (
          <HistoricalPriceChartV2
            data={assetInfoConfig.historicalChartData}
            onPointerHover={assetInfoConfig.setHoverPrice}
            onPointerOut={() => {
              assetInfoConfig.setHoverPrice(0, undefined);
            }}
          />
        ) : (
          <ChartUnavailable />
        )}
      </div>

      <TokenChartFooter />
    </section>
  );
};

export const TokenChartFooter = observer(() => {
  const { assetInfoConfig } = useAssetInfoView();
  const { t } = useTranslation();

  return (
    <footer className="flex justify-between">
      <ButtonGroup
        onValueChange={assetInfoConfig.setHistoricalRange}
        defaultValue={assetInfoConfig.historicalRange}
      >
        <ButtonGroupItem
          value="1h"
          label={t("tokenInfos.chart.xHour", { h: "1" })}
        />
        <ButtonGroupItem
          value="1d"
          label={t("tokenInfos.chart.xDay", { d: "1" })}
        />
        <ButtonGroupItem
          value="7d"
          label={t("tokenInfos.chart.xDay", { d: "7" })}
        />
        <ButtonGroupItem
          value="1mo"
          label={t("tokenInfos.chart.xDay", { d: "30" })}
        />
        <ButtonGroupItem
          value="1y"
          label={t("tokenInfos.chart.xYear", { y: "1" })}
        />
        <ButtonGroupItem value="all" label={t("tokenInfos.chart.all")} />
      </ButtonGroup>
    </footer>
  );
});

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

    return price;
  }, [assetInfoConfig.hoverPrice, assetPrice]);

  const fiatSymbol =
    assetInfoConfig.hoverPrice?.fiatCurrency?.symbol ??
    assetPrice?.fiatCurrency.symbol;

  return (
    <header className="absolute left-0 top-0 z-10">
      <HistoricalPriceChartHeaderV2
        isLoading={isLoading}
        hoverPrice={hoverPrice}
        hoverDate={assetInfoConfig.hoverDate}
        fiatSymbol={fiatSymbol}
      />
    </header>
  );
});
