import { Dec } from "@keplr-wallet/unit";
import axios from "axios";
import { observer } from "mobx-react-lite";
import type { GetStaticProps, InferGetServerSidePropsType } from "next";
import { useEffect, useMemo, useRef } from "react";

import { Ad, AdCMS } from "~/components/ad-banner/ad-banner-types";
import { ProgressiveSvgImage } from "~/components/progressive-svg-image";
import { SwapTool } from "~/components/swap-tool";
import { ADS_BANNER_URL, EventName, IS_FRONTIER, IS_TESTNET } from "~/config";
import { useAmplitudeAnalytics } from "~/hooks";
import { useFeatureFlags } from "~/hooks/use-feature-flags";
import { useStore } from "~/stores";

interface HomeProps {
  ads: Ad[];
}

export const getStaticProps: GetStaticProps<HomeProps> = async () => {
  let ads: Ad[] = [];

  try {
    const { data: adCMS }: { data: AdCMS } = await axios.get(ADS_BANNER_URL);
    ads = adCMS.banners.filter(({ featured }) => featured);
  } catch (error) {
    console.error("Error fetching ads:", error);
  }

  return { props: { ads }, revalidate: 3600 };
};

const Home = ({ ads }: InferGetServerSidePropsType<typeof getStaticProps>) => {
  const { chainStore, queriesStore, priceStore } = useStore();
  const { chainId } = chainStore.osmosis;

  const queries = queriesStore.get(chainId);
  const queryPools = queries.osmosis!.queryPools;

  const allPools = queryPools.getAllPools();

  const flags = useFeatureFlags();

  // Pools should be memoized before passing to trade in config
  const pools = useMemo(
    () =>
      allPools
        .filter((pool) => {
          // include all pools on testnet env
          if (IS_TESTNET) return true;

          // filter concentrated pools if feature flag is not enabled
          if (pool.type === "concentrated" && !flags.concentratedLiquidity)
            return false;

          // some min TVL
          return pool
            .computeTotalValueLocked(priceStore)
            .toDec()
            .gte(new Dec(IS_FRONTIER ? 1_000 : 10_000));
        })
        .sort((a, b) => {
          // sort by TVL to find routes amongst most valuable pools
          const aTVL = a.computeTotalValueLocked(priceStore);
          const bTVL = b.computeTotalValueLocked(priceStore);

          return Number(bTVL.sub(aTVL).toDec().toString());
        }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [allPools, priceStore.response, flags.concentratedLiquidity]
  );

  const requestedRemaining = useRef(false);
  useEffect(() => {
    if (requestedRemaining.current) return;
    queryPools.fetchRemainingPools();
    requestedRemaining.current = true;
  }, [queryPools]);

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
              lowResXlinkHref={
                IS_FRONTIER
                  ? "/images/osmosis-cowboy-woz-low.png"
                  : "/images/supercharged-wosmongton-low.png"
              }
              xlinkHref={
                IS_FRONTIER
                  ? "/images/osmosis-cowboy-woz.png"
                  : "/images/supercharged-wosmongton.png"
              }
              x={IS_FRONTIER ? "-100" : "56"}
              y={IS_FRONTIER ? "100" : "175"}
              width={IS_FRONTIER ? "800" : "578.7462"}
              height={IS_FRONTIER ? "800" : "725.6817"}
            />
          </g>
        </svg>
      </div>
      <div className="my-auto flex h-auto w-full items-center">
        <div className="ml-auto mr-[15%] flex w-[27rem] flex-col gap-4 lg:mx-auto md:mt-mobile-header">
          <SwapTool containerClassName="w-full" pools={pools} ads={ads} />
        </div>
      </div>
    </main>
  );
};

export default observer(Home);
