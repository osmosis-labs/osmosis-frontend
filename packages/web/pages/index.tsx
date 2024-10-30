import dayjs from "dayjs";
import { observer } from "mobx-react-lite";
import Image from "next/image";
import { useLocalStorage } from "react-use";

import { AdBanners } from "~/components/ad-banner";
import { ErrorBoundary } from "~/components/error/error-boundary";
import { TradeTool } from "~/components/trade-tool";
import { EventName } from "~/config";
import { useAmplitudeAnalytics, useFeatureFlags, useNavBar } from "~/hooks";
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

  useNavBar({ hideTitle: true });

  return (
    <main className="relative flex h-full overflow-auto pb-2 pt-8">
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
            <TradeTool
              page="Swap Page"
              previousTrade={previousTrade}
              setPreviousTrade={setPreviousTrade}
            />
          </div>
        </div>
      </div>
    </main>
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
