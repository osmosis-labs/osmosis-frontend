import { useQuery } from "@tanstack/react-query";
import { observer } from "mobx-react-lite";

import { AdBanner } from "~/components/ad-banner";
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

  return (
    <main className="flex h-full flex-col items-center justify-center gap-4 overflow-auto bg-osmoverse-1000 px-8 py-2">
      <header className="mt-0 flex w-full items-end justify-between 2xl:mt-mobile-header">
        <YourTotalBalance />
        <div className="flex w-[27rem] items-stretch">
          {featureFlags.swapsAdBanner && <SwapAdsBanner />}
        </div>
      </header>
      <div className="flex w-full rounded-5xl bg-osmoverse-900">
        <ChartSection />
        <div className="min-w-[27rem]">
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
