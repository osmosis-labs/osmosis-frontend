import { observer } from "mobx-react-lite";
import type { NextPage } from "next";
import { useRef } from "react";
import { ProgressiveSvgImage } from "../components/progressive-svg-image";
import { TradeClipboard } from "../components/trade-clipboard";
import { useWindowSize } from "../hooks";
import { useStore } from "../stores";

const Home: NextPage = observer(function () {
  const { chainStore, queriesStore } = useStore();

  const containerRef = useRef<HTMLElement | null>(null);

  const windowSize = useWindowSize();

  const chainInfo = chainStore.osmosis;

  const queries = queriesStore.get(chainInfo.chainId);
  const queryPools = queries.osmosis.queryGammPools;

  const pools = queryPools.getAllPools().map((pool) => pool.pool);

  const imageRatio = 1300 / 900;

  return (
    <main className="relative bg-background h-screen" ref={containerRef}>
      <div className="absolute w-full h-full bg-home-bg-pattern bg-repeat-x bg-cover">
        <svg
          className="absolute w-full h-full lg:hidden"
          pointerEvents="none"
          viewBox="0 0 1300 900"
          height="900"
          preserveAspectRatio={(() =>
            windowSize.width / windowSize.height > imageRatio
              ? "xMinYMid meet"
              : "xMidYMid slice")()}
        >
          <g>
            <ProgressiveSvgImage
              lowResXlinkHref="/images/osmosis-home-bg-low.png"
              xlinkHref="/images/osmosis-home-bg.png"
              x="56"
              y="97"
              width="578.7462"
              height="725.6817"
            />
            <rect x="-3000" y="778" width="8660" height="244" fill="#120644" />
            <ProgressiveSvgImage
              lowResXlinkHref="/images/osmosis-home-fg-low.png"
              xlinkHref="/images/osmosis-home-fg.png"
              x="61"
              y="602"
              width="448.8865"
              height="285.1699"
            />
          </g>
        </svg>
      </div>
      <div className="w-full h-full flex items-center overflow-x-hidden overflow-y-auto">
        <TradeClipboard
          containerClassName="max-w-[32.5rem] ml-auto mr-[10%] lg:mx-auto"
          pools={pools}
        />
      </div>
    </main>
  );
});

export default Home;
