import type { NextPage } from "next";
import { observer } from "mobx-react-lite";
import { useStore } from "../stores";
import { TradeClipboard } from "../components/trade-clipboard";
import { ProgressiveSvgImage } from "../components/progressive-svg-image";
import { useEffect, useMemo, useRef, useState } from "react";

const Home: NextPage = observer(function () {
  const { chainStore, accountStore, queriesOsmosisStore } = useStore();

  const containerRef = useRef<HTMLElement | null>(null);
  const [containerSize, setContainerSize] = useState<{
    width: number;
    height: number;
  }>({
    // Set 1 initially to prevent problems with mul and quo.
    width: 1,
    height: 1,
  });

  useEffect(() => {
    if (containerRef.current) {
      setContainerSize({
        width: containerRef.current.clientWidth,
        height: containerRef.current.clientHeight,
      });
    }

    // There seems to be no resize event for each element.
    // Instead, the container size is calculated each time the window is resized.
    // In other words, the operation of the container is guaranteed only when the container is not changed except for window resize.
    const onResize = () => {
      if (containerRef.current) {
        setContainerSize({
          width: containerRef.current.clientWidth,
          height: containerRef.current.clientHeight,
        });
      }
    };

    window.addEventListener("resize", onResize);

    return () => {
      window.removeEventListener("resize", onResize);
    };
  }, []);

  const chainInfo = chainStore.osmosis;
  const account = accountStore.getAccount(chainInfo.chainId);

  const queryOsmosis = queriesOsmosisStore.get(chainInfo.chainId);
  const queryPools = queryOsmosis.queryGammPools;

  const pools = useMemo(() => {
    return queryPools.pools.map((pool) => pool.pool);
  }, [queryPools.pools]);

  const imageRatio = 1300 / 900;

  return (
    <main className="relative bg-background h-screen" ref={containerRef}>
      <div className="absolute w-full h-full bg-home-bg-pattern bg-repeat-x bg-cover">
        <svg
          className="w-full h-full"
          pointerEvents="none"
          viewBox="0 0 1300 900"
          height="900"
          preserveAspectRatio={
            containerSize.width / containerSize.height > imageRatio
              ? "xMinYMid meet"
              : "xMidYMid slice"
          }
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
      <div className="absolute w-full h-full flex items-center overflow-y-auto">
        <TradeClipboard pools={pools} />
      </div>
    </main>
  );
});

export default Home;
