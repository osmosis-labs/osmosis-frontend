import { Dec } from "@keplr-wallet/unit";
import { UTCTimestamp } from "lightweight-charts";
import { observer } from "mobx-react-lite";
import { useMemo } from "react";

import { ChartUnavailable } from "~/components/chart";
import {
  HistoricalChart,
  HistoricalChartHeader,
} from "~/components/chart/historical-chart";
import { Spinner } from "~/components/loaders";
import { ButtonGroup, ButtonGroupItem } from "~/components/ui/button-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { useTranslation } from "~/hooks";
import { useAssetInfoView } from "~/hooks/use-asset-info-view";
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
      <TokenChartHeader />

      <div className="h-[400px] w-full xl:h-[476px]">
        {assetInfoConfig.isHistoricalDataLoading ? (
          <div className="flex h-full flex-col items-center justify-center">
            <Spinner />
          </div>
        ) : !assetInfoConfig.historicalChartUnavailable ? (
          <HistoricalChart
            data={data}
            onPointerHover={assetInfoConfig.setHoverData}
            onPointerOut={() => {
              assetInfoConfig.setHoverData(undefined, undefined);
            }}
          />
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
  const { t } = useTranslation();

  return (
    <footer className="flex flex-wrap justify-between gap-2">
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

      <div className="ml-auto flex gap-2">
        <Select
          onValueChange={assetInfoConfig.setDataType}
          defaultValue={assetInfoConfig.dataType}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="price">{t("tokenInfos.chart.price")}</SelectItem>
            <SelectItem value="volume">
              {t("tokenInfos.chart.volume")}
            </SelectItem>
          </SelectContent>
        </Select>
      </div>
    </footer>
  );
});

export const TokenChartHeader = observer(() => {
  const { assetInfoConfig } = useAssetInfoView();

  const { data: marketAsset, isLoading } =
    api.edge.assets.getUserMarketAsset.useQuery(
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
        data = marketAsset?.currentPrice?.toDec() ?? new Dec(0);
      } else {
        data = marketAsset?.volume24h?.toDec() ?? new Dec(0);
      }
    }

    return data;
  }, [assetInfoConfig.hoverData, assetInfoConfig.dataType, marketAsset]);

  const fiatSymbol =
    assetInfoConfig.hoverData?.fiatCurrency?.symbol ??
    marketAsset?.currentPrice?.symbol;

  return (
    <header className="absolute left-0 top-0 z-10">
      <HistoricalChartHeader
        isLoading={isLoading}
        hoverData={hoverData}
        hoverDate={assetInfoConfig.hoverDate}
        fiatSymbol={fiatSymbol}
      />
    </header>
  );
});