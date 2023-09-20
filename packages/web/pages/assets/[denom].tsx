import { Dec } from "@keplr-wallet/unit";
import { ObservableAssetInfoConfig } from "@osmosis-labs/stores";
import { observer } from "mobx-react-lite";
import { NextPage } from "next";
import { useRouter } from "next/router";
import { useMemo } from "react";
import { useEffect } from "react";
import { useUnmount } from "react-use";

import { Icon } from "~/components/assets";
import { Button } from "~/components/buttons";
import LinkIconButton from "~/components/buttons/link-icon-button";
import TokenPairHistoricalChart, {
  ChartUnavailable,
  PriceChartHeader,
} from "~/components/chart/token-pair-historical";
import SkeletonLoader from "~/components/skeleton-loader";
import Spinner from "~/components/spinner";
import { useAssetInfoConfig, useFeatureFlags } from "~/hooks";
import { useStore } from "~/stores";
import { getDecimalCount } from "~/utils/number";
import { createContext } from "~/utils/react-context";

const AssetInfoPage: NextPage = observer(() => {
  const featureFlags = useFeatureFlags();
  const router = useRouter();

  useEffect(() => {
    if (
      typeof featureFlags.tokenInfo !== "undefined" &&
      !featureFlags.tokenInfo
    ) {
      router.push("/assets");
    }
  }, [featureFlags.tokenInfo, router]);

  if (!router.query.denom) {
    return null; // TODO: Add skeleton loader
  }

  return <AssetInfoView />;
});

const [AssetInfoViewProvider, useAssetInfoView] = createContext<{
  assetInfoConfig: ObservableAssetInfoConfig;
}>({
  name: "AssetInfoViewContext",
  strict: true,
});

const AssetInfoView = observer(() => {
  const featureFlags = useFeatureFlags();
  const router = useRouter();
  const { queriesExternalStore, priceStore } = useStore();
  const assetInfoConfig = useAssetInfoConfig(
    router.query.denom as string,
    queriesExternalStore,
    priceStore
  );

  useEffect(() => {
    if (
      typeof featureFlags.tokenInfo !== "undefined" &&
      !featureFlags.tokenInfo
    ) {
      router.push("/assets");
    }
  }, [featureFlags.tokenInfo, router]);

  useUnmount(() => {
    assetInfoConfig.dispose();
  });

  const contextValue = useMemo(
    () => ({
      assetInfoConfig,
    }),
    [assetInfoConfig]
  );

  return (
    <AssetInfoViewProvider value={contextValue}>
      <div className="mx-auto flex max-w-container flex-col gap-8 p-8 py-4">
        <Navigation />
        <div className="flex flex-col gap-4">
          <TokenChartSection />
        </div>
      </div>
    </AssetInfoViewProvider>
  );
});

const Navigation = observer(() => {
  const { assetInfoConfig } = useAssetInfoView();
  const denom = assetInfoConfig.denom;

  const chain = "Osmosis";

  return (
    <nav className="flex w-full flex-wrap justify-between gap-2">
      <div className="flex items-baseline gap-3">
        <h1 className="text-h4 font-h4">{chain}</h1>
        <h2 className="text-h4 font-h4 text-osmoverse-300">
          {denom?.toUpperCase()}
        </h2>
      </div>

      <div className="flex items-center gap-2">
        <Button
          mode="unstyled"
          className="rounded-xl bg-[#201B43] px-4 py-2 font-semibold text-osmoverse-300 hover:bg-osmoverse-700 active:bg-osmoverse-800"
          aria-label="Add to watchlist"
        >
          <Icon id="star" className="text-wosmongton-300" />
          Watchlist
        </Button>
        <LinkIconButton
          href="/"
          mode="icon-social"
          size="md-icon-social"
          aria-label="View on X"
          icon={
            <Icon className="h-[16px] w-[16px] text-osmoverse-400" id="X" />
          }
        />
        <LinkIconButton
          href="/"
          mode="icon-social"
          size="md-icon-social"
          aria-label="View website"
          icon={
            <Icon className="h-[24px] w-[24px] text-osmoverse-400" id="web" />
          }
        />
        <LinkIconButton
          href="/"
          mode="icon-social"
          size="md-icon-social"
          aria-label="View on CoinGecko"
          icon={
            <Icon
              className="h-[42px] w-[42px] text-osmoverse-300"
              id="coingecko"
            />
          }
        />
      </div>
    </nav>
  );
});

const TokenChartSection = () => {
  return (
    <section className="flex flex-col gap-3 rounded-5xl bg-osmoverse-850 p-8">
      <TokenChartHeader />
      <TokenChart />
    </section>
  );
};

const TokenChartHeader = observer(() => {
  const { assetInfoConfig } = useAssetInfoView();

  const minimumDecimals = 2;
  const maxDecimals = Math.max(
    getDecimalCount(
      (assetInfoConfig.hoverPrice?.toDec() ?? new Dec(0)).toString()
    ),
    minimumDecimals
  );

  return (
    <header>
      <SkeletonLoader isLoaded={Boolean(assetInfoConfig?.hoverPrice)}>
        <PriceChartHeader
          decimal={maxDecimals}
          hoverPrice={Number(
            (assetInfoConfig.hoverPrice?.toDec() ?? new Dec(0)).toString()
          )}
          historicalRange={assetInfoConfig.historicalRange}
          setHistoricalRange={assetInfoConfig.setHistoricalRange}
          fiatSymbol={assetInfoConfig.hoverPrice?.fiatCurrency?.symbol}
          classes={{
            priceHeaderClass: "!text-h2 !font-h2",
            pricesHeaderRootContainer: "items-center",
          }}
        />
      </SkeletonLoader>
    </header>
  );
});

const TokenChart = observer(() => {
  const { assetInfoConfig } = useAssetInfoView();
  return (
    <div className="h-[400px] w-full">
      {assetInfoConfig.isHistoricalChartLoading ? (
        <div className="flex h-full flex-col items-center justify-center">
          <Spinner />
        </div>
      ) : !assetInfoConfig.isHistoricalChartUnavailable ? (
        <>
          <TokenPairHistoricalChart
            showGradient
            data={assetInfoConfig.historicalChartData}
            annotations={[]}
            domain={assetInfoConfig.yRange}
            onPointerHover={assetInfoConfig.setHoverPrice}
            onPointerOut={() => {
              if (assetInfoConfig.lastChartPrice) {
                assetInfoConfig.setHoverPrice(
                  assetInfoConfig.lastChartPrice.close
                );
              }
            }}
          />
        </>
      ) : (
        <ChartUnavailable />
      )}
    </div>
  );
});

export default AssetInfoPage;
