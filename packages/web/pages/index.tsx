import { Dec } from "@keplr-wallet/unit";
import { observer } from "mobx-react-lite";
import type { NextPage } from "next";
import { useMemo, useRef } from "react";

import { ProgressiveSvgImage } from "~/components/progressive-svg-image";
import { TradeClipboard } from "~/components/trade-clipboard";
import { useStore } from "~/stores";

import { EventName, IS_FRONTIER, IS_TESTNET } from "../config";
import { useAmplitudeAnalytics } from "../hooks";

const Home: NextPage = observer(function () {
  const { chainStore, queriesStore, priceStore } = useStore();
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
          if (IS_TESTNET) return true;

          // Trim not useful pools.

          const passed = poolsPassed.current.get(pool.id);
          if (passed) {
            return true;
          }

          // https://github.com/osmosis-labs/osmosis-frontend/issues/843
          if (pool.id === "800") {
            return false;
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

            // only pools with at least 10,000 USDC
            if (
              "originChainId" in asset.amount.currency &&
              asset.amount.currency.coinMinimalDenom ===
                "ibc/D189335C6E4A68B513C10AB227BF1C1D38C746766278BA3EEB4FB14124F1D858"
            ) {
              if (asset.amount.toDec().gt(new Dec(10_000))) {
                hasEnoughAssets = true;
                break;
              }
            }

            // only pools with at least 10,000 DAI
            if (
              "originChainId" in asset.amount.currency &&
              asset.amount.currency.coinMinimalDenom ===
                "ibc/0CD3A0285E1341859B5E86B6AB7682F023D03E97607CCC1DC95706411D866DF7"
            ) {
              if (asset.amount.toDec().gt(new Dec(10_000))) {
                hasEnoughAssets = true;
                break;
              }
            }

            // only pools with at least 10,000 USDT
            if (
              "originChainId" in asset.amount.currency &&
              asset.amount.currency.coinMinimalDenom ===
                "ibc/8242AD24008032E457D2E12D46588FD39FB54FB29680C6C7663D296B383C37C4"
            ) {
              if (asset.amount.toDec().gt(new Dec(10_000))) {
                hasEnoughAssets = true;
                break;
              }
            }

            // only pools with at least 1,000,000 STARS
            if (
              "originChainId" in asset.amount.currency &&
              asset.amount.currency.coinMinimalDenom ===
                "ibc/987C17B11ABC2B20019178ACE62929FE9840202CE79498E29FE8E5CB02B7C0A4"
            ) {
              if (asset.amount.toDec().gt(new Dec(1_000))) {
                hasEnoughAssets = true;
                break;
              }
            }

            // only pools with at least 10,000 JUNO
            if (
              "originChainId" in asset.amount.currency &&
              asset.amount.currency.coinMinimalDenom ===
                "ibc/46B44899322F3CD854D2D46DEEF881958467CDD4B3B10086DA49296BBED94BED"
            ) {
              if (asset.amount.toDec().gt(new Dec(10_000))) {
                hasEnoughAssets = true;
                break;
              }
            }

            // only pools with at least 35,000 EVMOS
            if (
              "originChainId" in asset.amount.currency &&
              asset.amount.currency.coinMinimalDenom ===
                "ibc/6AE98883D4D5D5FF9E50D7130F1305DA2FFA0C652D1DD9C123657C6B4EB2DF8A"
            ) {
              if (asset.amount.toDec().gt(new Dec(35_000))) {
                hasEnoughAssets = true;
                break;
              }
            }
          }

          if (hasEnoughAssets) {
            poolsPassed.current.set(pool.id, true);
          }

          return hasEnoughAssets;
        })
        .sort((a, b) => {
          // sort by TVL to find routes amongst most valuable pools
          const aTVL = a.computeTotalValueLocked(priceStore);
          const bTVL = b.computeTotalValueLocked(priceStore);

          return Number(bTVL.sub(aTVL).toDec().toString());
        }),
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
