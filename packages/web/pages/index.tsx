import { observer } from "mobx-react-lite";
import type { NextPage } from "next";
import { ProgressiveSvgImage } from "../components/progressive-svg-image";
import { TradeClipboard } from "../components/trade-clipboard";
import { useWindowSize } from "../hooks";
import { useStore } from "../stores";
import { IS_FRONTIER } from "../config";

const Home: NextPage = observer(function () {
  const { chainStore, queriesStore } = useStore();
  const windowSize = useWindowSize();
  const { chainId } = chainStore.osmosis;

  const queries = queriesStore.get(chainId);
  const queryPools = queries.osmosis!.queryGammPools;

  const pools = queryPools.getAllPools().map((pool) => pool.pool);

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
          containerClassName="w-[32.5rem] md:w-[29.9rem] ml-auto mr-[10%] lg:mx-auto"
          pools={pools}
        />
      </div>
    </main>
  );
});

export default Home;
