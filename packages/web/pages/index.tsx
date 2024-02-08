import { useQuery } from "@tanstack/react-query";
import classNames from "classnames";
import { observer } from "mobx-react-lite";
import { useLocalStorage } from "react-use";

import { AdBanner } from "~/components/ad-banner";
import { Icon } from "~/components/assets";
import ErrorBoundary from "~/components/error/error-boundary";
import { ChartSection } from "~/components/home/chart-section";
import { YourTotalBalance } from "~/components/home/your-total-balance";
import { SwapTool } from "~/components/swap-tool";
import { EventName } from "~/config";
import { useAmplitudeAnalytics, useFeatureFlags } from "~/hooks";
import { queryOsmosisCMS } from "~/server/queries/osmosis/cms";

const Home = () => {
  const featureFlags = useFeatureFlags();

  useAmplitudeAnalytics({
    onLoadEvent: [EventName.Swap.pageViewed, { isOnHome: true }],
  });

  const [isChartVisible, setIsChartVisible] = useLocalStorage(
    "isChartVisible",
    false
  );

  return (
    <main className="flex h-full w-full px-8 py-2 lg:px-12 1.5xs:px-4">
      <div className="mx-auto w-full max-w-[1700px]">
        <header className="mt-0 flex w-full items-end justify-between 1.5xl:mt-mobile-header lg:flex-col lg:items-start">
          <YourTotalBalance />
          <div className="mt-6 flex w-[27rem] items-stretch lg:w-full">
            {featureFlags.swapsAdBanner && <SwapAdsBanner />}
          </div>
          <div className="mt-4 hidden w-full lg:block">
            <SwapTool />
          </div>
        </header>
        <div className="mt-4 flex w-full overflow-x-hidden 1.5lg:justify-center 1.5lg:bg-transparent">
          <ChartSection isChartVisible={isChartVisible ?? false} />
          <div
            className={classNames(
              "relative min-w-[27rem] border-l border-l-osmoverse-900 bg-osmoverse-850 1.5lg:w-[27rem] 1.5lg:min-w-[auto] lg:hidden",
              {
                "rounded-tr-3xl rounded-br-3xl": isChartVisible,
                "rounded-3xl": !isChartVisible,
              }
            )}
          >
            <button
              onClick={() => setIsChartVisible(!isChartVisible)}
              className="absolute top-9 left-8 z-10"
            >
              <Icon
                id={isChartVisible ? "collapse-right" : "graph"}
                className="h-6 w-6"
              />
            </button>
            <SwapTool />
          </div>
        </div>
      </div>
    </main>
  );
};

export interface SwapAdBannerResponse {
  banners: {
    name: string;
    startDate: string;
    endDate: string;
    headerOrTranslationKey: string;
    subheaderOrTranslationKey: string;
    externalUrl: string;
    iconImageUrl: string;
    iconImageAltOrTranslationKey: string;
    gradient: string;
    fontColor: string;
    arrowColor: string;
    featured: true;
  }[];
  localization: Record<string, Record<string, any>>;
}

const SwapAdsBanner = () => {
  /**
   * Fetches the latest update from the osmosis-labs/fe-content repo
   * @see https://github.com/osmosis-labs/fe-content/blob/main/cms/swap-rotating-banner.json
   */
  const { data, isLoading } = useQuery({
    queryKey: ["swap-ads-banner"],
    queryFn: () =>
      queryOsmosisCMS<SwapAdBannerResponse>({
        filePath: "cms/swap-rotating-banner.json",
      }),
    staleTime: 1000 * 60 * 30, // 30 minutes
    cacheTime: 1000 * 60 * 30, // 30 minutes
  });

  if (!data?.banners || isLoading) return null;

  return (
    // If there is an error, we don't want to show the banner
    <ErrorBoundary fallback={null}>
      <AdBanner ads={data.banners} localization={data.localization} />
    </ErrorBoundary>
  );
};

export default observer(Home);
