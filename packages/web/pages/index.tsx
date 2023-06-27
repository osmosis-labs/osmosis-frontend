import { Dec } from "@keplr-wallet/unit";
import { observer } from "mobx-react-lite";
import type { NextPage } from "next";
import { useMemo } from "react";

import { ProgressiveSvgImage } from "~/components/progressive-svg-image";
import { TradeClipboard } from "~/components/trade-clipboard";
import { useStore } from "~/stores";

import { EventName, IS_FRONTIER, IS_TESTNET } from "../config";
import { useAmplitudeAnalytics } from "../hooks";

// test comment

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
      <div className="flex h-full w-full items-center overflow-y-auto overflow-x-hidden">
        <TradeClipboard
          containerClassName="w-[27rem] md:mt-mobile-header ml-auto mr-[15%] lg:mx-auto"
          pools={pools}
        />
      </div>
    </main>
  );
});

export default Home;
