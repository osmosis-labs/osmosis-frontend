import dayjs from "dayjs";
import { observer } from "mobx-react-lite";
import Image from "next/image";
import { useRouter } from "next/router";
import { useLocalStorage } from "react-use";

import { AdBanners } from "~/components/ad-banner";
import {
  AssetHighlights,
  highlightPrice24hChangeAsset,
} from "~/components/assets/highlights-categories";
import { ClientOnly } from "~/components/client-only";
import { ErrorBoundary } from "~/components/error/error-boundary";
import { TradeTool } from "~/components/trade-tool";
import { EventName } from "~/config";
import {
  useAmplitudeAnalytics,
  useFeatureFlags,
  useTranslation,
} from "~/hooks";
import { api } from "~/utils/trpc";

export const SwapPreviousTradeKey = "swap-previous-trade";
export type PreviousTrade = {
  sendTokenDenom: string;
  outTokenDenom: string;
  baseDenom: string;
  quoteDenom: string;
};

const Home = () => {
  const featureFlags = useFeatureFlags();

  const [previousTrade, setPreviousTrade] =
    useLocalStorage<PreviousTrade>(SwapPreviousTradeKey);

  useAmplitudeAnalytics({
    onLoadEvent: [EventName.Swap.pageViewed, { isOnHome: true }],
  });

  return (
    <main className="relative flex overflow-auto pb-2 pt-8 h-content md:h-content-mobile">
      <div className="fixed inset-0 h-full w-full overflow-y-scroll bg-cover xl:static">
        <div className="relative h-full w-full xl:hidden">
          <Image
            src="/images/osmosis-home-bg-alt.svg"
            alt=""
            width={1544}
            height={720}
            className="absolute bottom-0 max-h-[720px] w-full"
          />
        </div>
        <div className="absolute inset-0 top-[104px] flex h-auto w-full justify-center md:top-0">
          <div className="flex w-[512px] flex-col gap-4 lg:mx-auto md:mt-5 md:w-full md:px-5">
            {featureFlags.swapsAdBanner && <SwapAdsBanner />}
            {/** Hydration issues need to be investigated before this client wrapper can be removed. */}
            <ClientOnly>
              <TradeTool
                page="Swap Page"
                previousTrade={previousTrade}
                setPreviousTrade={setPreviousTrade}
              />
            </ClientOnly>
            {featureFlags.swapToolTopGainers && <TopGainers />}
          </div>
        </div>
      </div>
    </main>
  );
};

const TopGainers = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const { logEvent } = useAmplitudeAnalytics();

  const { data: topGainerAssets, isLoading: isTopGainerAssetsLoading } =
    api.edge.assets.getTopGainerAssets.useQuery({
      topN: 4,
    });

  return (
    <AssetHighlights
      className="bg-osmoverse-1000/40 px-2"
      title={t("assets.highlights.topGainers")}
      subtitle="24h"
      isLoading={isTopGainerAssetsLoading}
      assets={(topGainerAssets ?? []).map(highlightPrice24hChangeAsset)}
      onClickSeeAll={() => {
        logEvent([EventName.Swap.checkTopGainers, { token: "All" }]);
        router.push(`/assets?category=topGainers`);
      }}
      onClickAsset={(asset) => {
        logEvent([EventName.Swap.checkTopGainers, { token: asset.coinDenom }]);
      }}
      highlight="topGainers"
    />
  );
};

const SwapAdsBanner = observer(() => {
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

  return (
    // If there is an error, we don't want to show the banner
    <ErrorBoundary fallback={null}>
      <AdBanners ads={data.banners} localization={data.localization} />
    </ErrorBoundary>
  );
});

export default observer(Home);
