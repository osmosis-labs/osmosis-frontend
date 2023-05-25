import { Dec } from "@keplr-wallet/unit";
import { observer } from "mobx-react-lite";
import type { NextPage } from "next";
import { useEffect, useMemo, useRef } from "react";

import { ProgressiveSvgImage } from "~/components/progressive-svg-image";
import { SwapTool } from "~/components/swap-tool";
import { EventName, IS_FRONTIER, IS_TESTNET } from "~/config";
import { useAmplitudeAnalytics } from "~/hooks";
import { useStore } from "~/stores";

const Home: NextPage = observer(function () {
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
        .filter(
          (pool) =>
            IS_TESTNET ||
            pool
              .computeTotalValueLocked(priceStore)
              .toDec()
              .gte(new Dec(IS_FRONTIER ? 1_000 : 10_000))
        )
        .sort((a, b) => {
          // sort by TVL to find routes amongst most valuable pools
          const aTVL = a.computeTotalValueLocked(priceStore);
          const bTVL = b.computeTotalValueLocked(priceStore);

          return Number(bTVL.sub(aTVL).toDec().toString());
        }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [allPools, priceStore.response]
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
                IS_FRONTIER ? "/images/osmosis-cowboy-woz-low.png" : undefined
              }
              xlinkHref={
                IS_FRONTIER
                  ? "/images/osmosis-cowboy-woz.png"
                  : "/images/ibcx-web-bg.png"
              }
              x={IS_FRONTIER ? "-100" : "-140"}
              y={IS_FRONTIER ? "100" : "0"}
              width={IS_FRONTIER ? "800" : "130%"}
              height={IS_FRONTIER ? "800" : "100%"}
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
