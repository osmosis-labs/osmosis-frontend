import { Dec } from "@keplr-wallet/unit";
import { useFlags } from "launchdarkly-react-client-sdk";
import { observer } from "mobx-react-lite";
import type { NextPage } from "next";
import { useEffect, useMemo, useRef } from "react";

import { ProgressiveSvgImage } from "~/components/progressive-svg-image";
import { SwapTool } from "~/components/swap-tool";
import { EventName, IS_FRONTIER, IS_TESTNET } from "~/config";
import { useAmplitudeAnalytics } from "~/hooks";
import { useStore } from "~/stores";

const Home: NextPage = observer(function () {
  const featureFlags = useFlags();

  const { chainStore, queriesStore, priceStore } = useStore();
  const { chainId } = chainStore.osmosis;

  const queries = queriesStore.get(chainId);
  const queryPools = queries.osmosis!.queryGammPools;

  const allPools = queryPools.getAllPools();

  // Pools should be memoized before passing to trade in config
  const pools = useMemo(
    () =>
      allPools
        .filter((pool) => {
          // include all pools on testnet env
          if (IS_TESTNET) return true;

          // filter concentrated pools if feature flag is not enabled
          if (
            pool.type === "concentrated" &&
            !featureFlags.concentratedLiquidity
          )
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
    [allPools, priceStore.response, featureFlags.concentratedLiquidity]
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
      <div className="flex h-full w-full items-center overflow-y-auto overflow-x-hidden">
        <SwapTool
          containerClassName="w-[27rem] md:mt-mobile-header ml-auto mr-[15%] lg:mx-auto"
          pools={pools}
        />
      </div>
    </main>
  );
});

export default Home;
