import { observer } from "mobx-react-lite";
import type { NextPage } from "next";
import { ProgressiveSvgImage } from "../components/progressive-svg-image";
import { TradeClipboard } from "../components/trade-clipboard";
import { useStore } from "../stores";
import { IS_FRONTIER } from "../config";
import { Dec } from "@keplr-wallet/unit";
import { useMemo, useRef } from "react";

const Home: NextPage = observer(function () {
  const { chainStore, queriesStore } = useStore();
  const { chainId } = chainStore.osmosis;

  const queries = queriesStore.get(chainId);
  const queryPools = queries.osmosis!.queryGammPools;

  // If pool has already passed once, it will be passed immediately without recalculation.
  const poolsPassed = useRef<Map<string, boolean>>(new Map());
  const allPools = queryPools.getAllPools();
  // Pools should be memoized before passing to trade in config
  const pools = useMemo(
    () =>
      allPools
        .filter((pool) => {
          // TODO: If not on production environment, this logic should pass all pools (or other selection standard).

          // Trim not useful pools.

          const passed = poolsPassed.current.get(pool.id);
          if (passed) {
            return true;
          }

          // There is currently no good way to pick a pool that is worthwhile.
          // For now, based on the mainnet, only those pools with assets above a certain value are calculated for swap.

          let hasEnoughAssets = false;

          for (const asset of pool.poolAssets) {
            // Probably, the pools that include gamm token may be created mistakenly by users.
            if (
              asset.amount.currency.coinMinimalDenom.startsWith("gamm/pool/")
            ) {
              return false;
            }

            // Only pools with at least 1000 osmo are dealt with.
            if (asset.amount.currency.coinMinimalDenom === "uosmo") {
              if (asset.amount.toDec().gt(new Dec(1000))) {
                hasEnoughAssets = true;
                break;
              }
            }

            // Only pools with at least 10 ion are dealt with.
            if (asset.amount.currency.coinMinimalDenom === "uion") {
              if (asset.amount.toDec().gt(new Dec(10))) {
                hasEnoughAssets = true;
                break;
              }
            }

            // Only pools with at least 1000 atom are dealt with.
            if (
              "originChainId" in asset.amount.currency &&
              asset.amount.currency.coinMinimalDenom ===
                "ibc/27394FB092D2ECCD56123C74F36E4C1F926001CEADA9CA97EA622B25F41E5EB2"
            ) {
              if (asset.amount.toDec().gt(new Dec(1000))) {
                hasEnoughAssets = true;
                break;
              }
            }
          }

          if (hasEnoughAssets) {
            console.log(`${pool.id} will be included to swap router`);
            poolsPassed.current.set(pool.id, true);
          }

          return hasEnoughAssets;
        })
        .map((pool) => pool.pool),
    [allPools]
  );

  return (
    <main className="relative bg-background h-screen">
      <div className="absolute w-full h-full bg-home-bg-pattern bg-repeat-x bg-cover">
        <svg
          className="absolute w-full h-full lg:hidden"
          pointerEvents="none"
          viewBox="0 0 1300 900"
          height="900"
          preserveAspectRatio={"xMidYMid slice"}
        >
          <g>
            {!IS_FRONTIER && (
              <ProgressiveSvgImage
                lowResXlinkHref="/images/osmosis-home-bg-low.png"
                xlinkHref="/images/osmosis-home-bg.png"
                x="56"
                y="97"
                width="578.7462"
                height="725.6817"
              />
            )}
            {!IS_FRONTIER && (
              <rect
                x="-3000"
                y="778"
                width="8660"
                height="244"
                fill="#120644"
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
              y={IS_FRONTIER ? "100" : "602"}
              width={IS_FRONTIER ? "800" : "448.8865"}
              height={IS_FRONTIER ? "800" : "285.1699"}
            />
          </g>
        </svg>
      </div>
      <div className="w-full h-full flex items-center overflow-x-hidden overflow-y-auto">
        <TradeClipboard
          containerClassName="w-[32.5rem] md:w-[29.9rem] md:mt-mobile-header ml-auto mr-[10%] lg:mx-auto"
          pools={pools}
        />
      </div>
    </main>
  );
});

export default Home;
