import { Dec } from "@keplr-wallet/unit";
import { UTCTimestamp } from "lightweight-charts";
import { observer } from "mobx-react-lite";
import { useMemo } from "react";

import { ChartUnavailable } from "~/components/chart";
import {
  HistoricalChart,
  HistoricalChartHeader,
  HistoricalChartSkeleton,
} from "~/components/chart/historical-chart";
import {
  HistoricalVolumeChart,
  HistoricalVolumeChartSkeleton,
} from "~/components/chart/historical-volume-chart";
import { AdvancedChart } from "~/components/chart/light-weight-charts/advanced-chart";
import { Button } from "~/components/ui/button";
import { ButtonGroup, ButtonGroupItem } from "~/components/ui/button-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { useFeatureFlags, useTranslation } from "~/hooks";
import { AvailablePriceRanges } from "~/hooks/ui-config";
import { useAssetInfoView } from "~/hooks/use-asset-info-view";
import { historicalDatafeed } from "~/utils/trading-view";
import { api } from "~/utils/trpc";

export const TokenChart = observer(() => {
  const { assetInfoConfig } = useAssetInfoView();

  const data = useMemo(
    () =>
      assetInfoConfig.historicalChartData.map((point) => ({
        time: point.time as UTCTimestamp,
        value:
          assetInfoConfig.dataType === "price" ? point.close : point.volume,
      })),
    [assetInfoConfig.historicalChartData, assetInfoConfig.dataType]
  );

  return (
    <section className="relative flex flex-col justify-between gap-3">
      {assetInfoConfig.mode === "simple" ? <TokenChartHeader /> : null}

      <div className="h-[400px] w-full xl:h-[476px]">
        {assetInfoConfig.mode === "advanced" ? (
          <AdvancedChart
            datafeed={historicalDatafeed}
            coinDenom={assetInfoConfig.denom}
            load_last_chart
          />
        ) : assetInfoConfig.isHistoricalDataLoading ? (
          assetInfoConfig.dataType === "price" ? (
            <HistoricalChartSkeleton />
          ) : (
            <HistoricalVolumeChartSkeleton />
          )
        ) : !assetInfoConfig.historicalChartUnavailable ? (
          assetInfoConfig.dataType === "price" ? (
            <HistoricalChart
              data={data}
              onPointerHover={assetInfoConfig.setHoverData}
              onPointerOut={() => {
                assetInfoConfig.setHoverData(undefined, undefined);
              }}
            />
          ) : (
            <HistoricalVolumeChart
              data={data}
              onPointerHover={assetInfoConfig.setHoverData}
              onPointerOut={() => {
                assetInfoConfig.setHoverData(undefined, undefined);
              }}
            />
          )
        ) : (
          <ChartUnavailable />
        )}
      </div>

      <TokenChartFooter />
    </section>
  );
});

export const TokenChartFooter = observer(() => {
  const { assetInfoConfig } = useAssetInfoView();
  const { advancedChart } = useFeatureFlags();
  const { t } = useTranslation();

  return (
    <footer className="flex flex-wrap justify-between gap-2">
      {assetInfoConfig.mode === "simple" ? (
        <ButtonGroup
          onValueChange={assetInfoConfig.setHistoricalRange}
          defaultValue={assetInfoConfig.historicalRange}
        >
          <ButtonGroupItem
            value={AvailablePriceRanges["1h"]}
            label={t("tokenInfos.chart.xHour", { h: "1" })}
          />
          <ButtonGroupItem
            value={AvailablePriceRanges["1d"]}
            label={t("tokenInfos.chart.xDay", { d: "1" })}
          />
          <ButtonGroupItem
            value={AvailablePriceRanges["7d"]}
            label={t("tokenInfos.chart.xDay", { d: "7" })}
          />
          <ButtonGroupItem
            value={AvailablePriceRanges["1mo"]}
            label={t("tokenInfos.chart.xDay", { d: "30" })}
          />
          <ButtonGroupItem
            value={AvailablePriceRanges["1y"]}
            label={t("tokenInfos.chart.xYear", { y: "1" })}
          />
          <ButtonGroupItem
            value={AvailablePriceRanges.all}
            label={t("tokenInfos.chart.all")}
          />
        </ButtonGroup>
      ) : null}

      <div className="ml-auto flex gap-2">
        {assetInfoConfig.mode === "simple" ? (
          <Select
            onValueChange={assetInfoConfig.setDataType}
            defaultValue={assetInfoConfig.dataType}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="price">
                {t("tokenInfos.chart.price")}
              </SelectItem>
              <SelectItem value="volume">
                {t("tokenInfos.chart.volume")}
              </SelectItem>
            </SelectContent>
          </Select>
        ) : null}

        {advancedChart ? (
          <Button
            size="xsm"
            variant="secondary-outline"
            onClick={() => {
              assetInfoConfig.setMode(
                assetInfoConfig.mode === "simple" ? "advanced" : "simple"
              );
            }}
          >
            {assetInfoConfig.mode === "simple"
              ? t("tokenInfos.chart.advanced")
              : t("tokenInfos.chart.simple")}
          </Button>
        ) : null}
      </div>
    </footer>
  );
});

export const TokenChartHeader = observer(() => {
  const { assetInfoConfig } = useAssetInfoView();

  const { data: marketAsset, isLoading } =
    api.edge.assets.getMarketAsset.useQuery(
      {
        findMinDenomOrSymbol: assetInfoConfig.coinMinimalDenom!,
      },
      {
        enabled: assetInfoConfig.coinMinimalDenom !== undefined,
      }
    );

  const hoverData = useMemo(() => {
    let data = new Dec(0);
    const decHoverPrice = assetInfoConfig.hoverData?.toDec();

    if (decHoverPrice) {
      data = decHoverPrice;
    } else {
      if (assetInfoConfig.dataType === "price") {
        data =
          marketAsset?.currentPrice?.toDec() ??
          new Dec(assetInfoConfig.lastChartData?.close ?? 0);
      } else {
        data = marketAsset?.volume24h?.toDec() ?? new Dec(0);
      }
    }

    return data;
  }, [
    assetInfoConfig.hoverData,
    assetInfoConfig.dataType,
    assetInfoConfig.lastChartData?.close,
    marketAsset?.currentPrice,
    marketAsset?.volume24h,
  ]);

  const fiatSymbol =
    assetInfoConfig.hoverData?.fiatCurrency?.symbol ??
    marketAsset?.currentPrice?.symbol ??
    "$";

  return (
    <header className="absolute left-0 top-0 z-10">
      <HistoricalChartHeader
        isLoading={isLoading || assetInfoConfig.isHistoricalDataLoading}
        hoverData={hoverData}
        hoverDate={assetInfoConfig.hoverDate}
        fiatSymbol={fiatSymbol}
      />
    </header>
  );
});
