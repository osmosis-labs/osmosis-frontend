import dayjs from "dayjs";
import { observer } from "mobx-react-lite";

import { Ad, AdBanners } from "~/components/ad-banner";
import ErrorBoundary from "~/components/error/error-boundary";
import { ProgressiveSvgImage } from "~/components/progressive-svg-image";
import { SwapTool } from "~/components/swap-tool";
import { EventName } from "~/config";
import {
  useAmplitudeAnalytics,
  useFeatureFlags,
  useTranslation,
} from "~/hooks";
import { useGlobalIs1CTIntroModalScreen } from "~/modals";
import { theme } from "~/tailwind.config";
import { api } from "~/utils/trpc";

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
  const [, set1CTIntroModalScreen] = useGlobalIs1CTIntroModalScreen();
  const flags = useFeatureFlags();
  const { t } = useTranslation();
  const { data, isLoading } = api.local.cms.getSwapAdBanners.useQuery(
    undefined,
    {
      staleTime: 1000 * 60 * 30, // 30 minutes
      cacheTime: 1000 * 60 * 30, // 30 minutes
      select: (data) => ({
        ...data,
        banners: data.banners.filter((banner) =>
          banner.startDate || banner.endDate
            ? dayjs().isBetween(banner.startDate, banner.endDate)
            : true
        ),
      }),
    }
  );

  if (!data?.banners || isLoading) return null;

  const banners: Ad[] = flags.oneClickTrading
    ? [
        // Manually add the 1-Click Trading banner to enable state changes for opening the settings modal.
        {
          name: "one-click-trading",
          headerOrTranslationKey: t(
            "oneClickTrading.swapRotatingBanner.tradeQuickerAndEasier"
          ),
          subheaderOrTranslationKey: t(
            "oneClickTrading.swapRotatingBanner.startOneClickTradingNow"
          ),
          iconImageAltOrTranslationKey: t(
            "oneClickTrading.swapRotatingBanner.iconAlt"
          ),
          iconImageUrl: "/images/1ct-small-icon.svg",
          gradient: "linear-gradient(90deg, #8A86FF 0.04%, #E13CBD 99.5%)",
          fontColor: theme.colors.osmoverse["900"],
          arrowColor: theme.colors.ammelia["900"],
          onClick() {
            set1CTIntroModalScreen("settings-no-back-button");
          },
        } satisfies Ad,
        ...data.banners,
      ]
    : data.banners;

  return (
    // If there is an error, we don't want to show the banner
    <ErrorBoundary fallback={null}>
      <AdBanners ads={banners} localization={data.localization} />
    </ErrorBoundary>
  );
};

export default observer(Home);
