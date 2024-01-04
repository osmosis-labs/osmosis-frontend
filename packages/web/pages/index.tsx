import { useQuery } from "@tanstack/react-query";
import { observer } from "mobx-react-lite";

import { Ad, AdBanner } from "~/components/ad-banner";
import ErrorBoundary from "~/components/error/error-boundary";
import { ProgressiveSvgImage } from "~/components/progressive-svg-image";
import { SwapTool } from "~/components/swap-tool";
import { EventName, OsmosisCmsRepo } from "~/config";
import { useAmplitudeAnalytics, useFeatureFlags } from "~/hooks";
import { queryGithubFile } from "~/server/queries/github";

const Home = () => {
  const featureFlags = useFeatureFlags();

  useAmplitudeAnalytics({
    onLoadEvent: [EventName.Swap.pageViewed, { isOnHome: true }],
  });

  return (
    <main className="relative flex h-full items-center overflow-auto bg-osmoverse-900 py-2">
      <div className="pointer-events-none fixed h-full w-full bg-home-bg-pattern bg-cover bg-repeat-x">
        <svg
          className="absolute h-full w-full lg:hidden"
          pointerEvents="none"
          viewBox="0 0 1300 900"
          height="900"
          preserveAspectRatio="xMidYMid slice"
        >
          <g>
            <ProgressiveSvgImage
              lowResXlinkHref="/images/osmosis-home-bg-low.png"
              xlinkHref="/images/osmosis-home-bg.png"
              x="56"
              y="220"
              width="578.7462"
              height="725.6817"
            />
            <ProgressiveSvgImage
              lowResXlinkHref={"/images/osmosis-home-fg-low.png"}
              xlinkHref={"/images/osmosis-home-fg.png"}
              x={"61"}
              y={"682"}
              width={"448.8865"}
              height={"285.1699"}
            />
          </g>
        </svg>
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

const SwapAdsBanner = () => {
  /**
   * Fetches the latest update from the osmosis-labs/fe-content repo
   * @see https://github.com/osmosis-labs/fe-content/blob/main/cms/swap-rotating-banner.json
   */
  const { data, isLoading } = useQuery({
    queryKey: ["swap-ads-banner"],
    queryFn: () =>
      queryGithubFile<{ banners: Ad[] }>({
        repo: OsmosisCmsRepo,
        filePath: "cms/swap-rotating-banner.json",
      }),

    staleTime: 1000 * 60 * 30, // 30 minutes
    cacheTime: 1000 * 60 * 30, // 30 minutes
  });

  if (!data?.banners || isLoading) return null;

  return (
    // If there is an error, we don't want to show the banner
    <ErrorBoundary fallback={null}>
      <AdBanner ads={data.banners} />
    </ErrorBoundary>
  );
};

export default observer(Home);
