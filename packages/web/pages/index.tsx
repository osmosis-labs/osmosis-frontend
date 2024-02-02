import { useQuery } from "@tanstack/react-query";
import { observer } from "mobx-react-lite";

import { AdBanner } from "~/components/ad-banner";
import ErrorBoundary from "~/components/error/error-boundary";
import { SwapTool } from "~/components/swap-tool";
import { EventName } from "~/config";
import { useAmplitudeAnalytics, useFeatureFlags } from "~/hooks";
import { queryOsmosisCMS } from "~/server/queries/osmosis/cms";

const Home = () => {
  const featureFlags = useFeatureFlags();

  useAmplitudeAnalytics({
    onLoadEvent: [EventName.Swap.pageViewed, { isOnHome: true }],
  });

  return (
    <main className="relative flex h-full items-center overflow-auto bg-osmoverse-900 py-2">
      <div className="fixed flex h-full w-full items-center bg-osmoverse-1000">
        <div className="flex max-w-5xl flex-1 flex-col gap-4 pl-8">
          <div className="flex flex-col gap-3">
            <span className="text-subtitle1 text-osmoverse-300">
              Your total balance
            </span>
            <h3>$3,920,849.61</h3>
            <span className="inline-flex items-center gap-3">
              <span className="text-subititle1 text-bullish-500">
                ↗️ $1,863.96 &#40;5.6%&#41;
              </span>
              <span className="text-subititle1 inline-flex items-center gap-1 text-wosmongton-200">
                View assets
                <Icon id="arrow-right" color="#B3B1FD" className="h-4 w-4" />
              </span>
            </span>
          </div>
          <div className="flex items-center rounded-5xl bg-osmoverse-900 p-8">
            <div className="flex w-full justify-between">
              <div className="flex items-center gap-16">
                <div className="flex flex-col gap-1">
                  <span className="inline-flex items-center gap-1">
                    <h6 className="text-wosmongton-200">OSMO</h6>
                    <Icon
                      id="chevron-right"
                      color="#B3B1FD"
                      className="h-4 w-4"
                    />
                  </span>
                  <h4>$1.51</h4>
                  <span className="text-subititle1 text-bullish-500">
                    ↗️ 10.28%
                  </span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="inline-flex items-center gap-1">
                    <h6 className="text-wosmongton-200">ATOM</h6>
                    <Icon
                      id="chevron-right"
                      color="#B3B1FD"
                      className="h-4 w-4"
                    />
                  </span>
                  <h4>$10.12</h4>
                  <span className="text-subititle1 text-bullish-500">
                    ↗️ 7.71%
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button className="text-caption text-osmoverse-400">1H</button>
                <button className="text-caption text-osmoverse-400">1D</button>
                <button className="text-caption text-osmoverse-400">7D</button>
                <button className="text-caption text-osmoverse-400">30D</button>
                <button className="text-caption text-osmoverse-400">1Y</button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="my-auto flex h-auto w-full items-center">
        <div className="ml-auto mr-[15%] flex w-[27rem] flex-col gap-4 lg:mx-auto md:mt-mobile-header">
          {featureFlags.swapsAdBanner && <SwapAdsBanner />}
          <SwapTool />
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
