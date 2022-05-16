import { observer } from "mobx-react-lite";
import type { NextPage } from "next";
import { ProgressiveSvgImage } from "../components/progressive-svg-image";
import { TradeClipboard } from "../components/trade-clipboard";
import { IS_FRONTIER } from "../config";

const Home: NextPage = observer(function () {
  return (
    <main className="relative bg-background h-screen">
      <div className="h-full bg-home-bg-pattern bg-repeat-x bg-cover overflow-auto flex justify-center items-center">
        <svg
          className="absolute w-full h-full md:hidden"
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
              x={IS_FRONTIER ? "-140" : "61"}
              y={IS_FRONTIER ? "100" : "602"}
              width={IS_FRONTIER ? "800" : "448.8865"}
              height={IS_FRONTIER ? "800" : "285.1699"}
            />
          </g>
        </svg>
        <TradeClipboard className="absolute left-[min(calc(920*(100vh/1080)),calc((100vw_-_206px)*0.8_-_520px))]" />
      </div>
    </main>
  );
});

export default Home;
