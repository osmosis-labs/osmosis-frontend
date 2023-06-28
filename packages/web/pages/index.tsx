import { Dec } from "@keplr-wallet/unit";
import { useFlags } from "launchdarkly-react-client-sdk";
import { observer } from "mobx-react-lite";
import type { GetStaticProps, InferGetServerSidePropsType } from "next";
import { useMemo } from "react";

import { AdBanner } from "~/components/ad-banner/ad-banner";
import adCMS from "~/components/ad-banner/ad-banner-cms.json";
import { Ad } from "~/components/ad-banner/ad-banner-types";
import { ProgressiveSvgImage } from "~/components/progressive-svg-image";
import { TradeClipboard } from "~/components/trade-clipboard";
import { useStore } from "~/stores";

import { EventName, IS_FRONTIER, IS_TESTNET } from "../config";
import { useAmplitudeAnalytics } from "../hooks";

interface HomeProps {
  ads: Ad[];
}

export const getStaticProps: GetStaticProps<HomeProps> = async () => {
  const ads = adCMS.banners.filter(({ featured }) => featured);
  return { props: { ads } };
};

const Home = ({ ads }: InferGetServerSidePropsType<typeof getStaticProps>) => {
  const { chainStore, queriesStore, priceStore } = useStore();
  const { chainId } = chainStore.osmosis;

  const queries = queriesStore.get(chainId);
  const queryPools = queries.osmosis!.queryGammPools;

  // If pool has already passed once, it will be passed immediately without recalculation.
  const allPools = queryPools.getAllPools();
  // Pools should be memoized before passing to trade in config
  const pools = useMemo(
    () =>
      allPools
        .filter((pool) =>
          pool
            .computeTotalValueLocked(priceStore)
            .toDec()
            .gte(new Dec(IS_TESTNET ? -1 : IS_FRONTIER ? 1_000 : 10_000))
        )
        .sort((a, b) => {
          // sort by TVL to find routes amongst most valuable pools
          const aTVL = a.computeTotalValueLocked(priceStore);
          const bTVL = b.computeTotalValueLocked(priceStore);

          return Number(bTVL.sub(aTVL).toDec().toString());
        })
        .map((pool) => pool.pool),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [allPools, priceStore.response]
  );

  useAmplitudeAnalytics({
    onLoadEvent: [EventName.Swap.pageViewed, { isOnHome: true }],
  });

  const flags = useFlags();

  return (
    <main className="relative h-full bg-osmoverse-900">
      <div className="absolute h-full w-full bg-home-bg-pattern bg-cover bg-repeat-x">
        <svg
          className="absolute h-full w-full lg:hidden"
          pointerEvents="none"
          viewBox="0 0 1300 900"
          height="900"
          preserveAspectRatio="xMidYMid slice"
        >
          <g>
            {!IS_FRONTIER && (
              <ProgressiveSvgImage
                lowResXlinkHref="/images/osmosis-home-bg-low.png"
                xlinkHref="/images/osmosis-home-bg.png"
                x="56"
                y="220"
                width="578.7462"
                height="725.6817"
              />
            )}
            <ProgressiveSvgImage
              lowResXlinkHref={
                IS_FRONTIER
                  ? "/images/osmosis-cowboy-woz-low.png"
                  : "/images/osmosis-home-fg-low.png"
              }
              xlinkHref={
                IS_FRONTIER
                  ? "/images/osmosis-cowboy-woz.png"
                  : "/images/osmosis-home-fg.png"
              }
              x={IS_FRONTIER ? "-100" : "61"}
              y={IS_FRONTIER ? "100" : "682"}
              width={IS_FRONTIER ? "800" : "448.8865"}
              height={IS_FRONTIER ? "800" : "285.1699"}
            />
          </g>
        </svg>
      </div>
      <div className="ml-auto mr-[15%] flex h-full w-full items-center justify-center overflow-y-auto overflow-x-hidden lg:mx-auto md:mt-mobile-header">
        <div className="flex w-[27rem] flex-col gap-4">
          {flags.swapsAdBanner && <AdBanner ads={ads} />}
          <TradeClipboard containerClassName="w-full" pools={pools} />
        </div>
      </div>
    </main>
  );
};

export default observer(Home);
