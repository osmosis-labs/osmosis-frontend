import type { NextPage } from "next";
import { observer } from "mobx-react-lite";
import { useStore } from "../stores";
import { TradeClipboard } from "../components/trade-clipboard";
import { ProgressiveSvgImage } from "../components/progressive-svg-image";

const Home: NextPage = observer(function () {
  const { chainStore, accountStore, queriesOsmosisStore } = useStore();

  const chainInfo = chainStore.osmosis;
  const account = accountStore.getAccount(chainInfo.chainId);

  const queryOsmosis = queriesOsmosisStore.get(chainInfo.chainId);

  return (
    <main className="relative bg-background h-screen">
      <div className="h-full bg-home-bg-pattern bg-repeat-x bg-cover overflow-auto flex justify-center items-center">
        <svg
          className="absolute w-full h-full hidden md:block"
          pointerEvents="none"
          viewBox="0 0 1300 900"
          height="900"
          preserveAspectRatio="xMidYMid slice"
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
        <TradeClipboard className="absolute left-[min(calc(920*(100vh/1080)),calc((100vw_-_206px)*0.8_-_520px))]" />
      </div>
    </main>
  );
});

export default Home;
