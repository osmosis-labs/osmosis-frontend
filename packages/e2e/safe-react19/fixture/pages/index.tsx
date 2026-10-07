import Tippy, { useSingleton } from "@tippyjs/react";
import dayjs from "dayjs";
import advancedFormat from "dayjs/plugin/advancedFormat";
import {
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
  version,
} from "react";

import { DynamicLottieAnimation } from "~/components/animation/dynamic-lottie-animation";
import { ConcentratedLiquidityDepthChart } from "~/components/chart/concentrated-liquidity-depth";
import { AdvancedChart } from "~/components/chart/light-weight-charts/advanced-chart";
import { HistoricalPriceChart } from "~/components/chart/price-historical";
import {
  Drawer,
  DrawerButton,
  DrawerContent,
  DrawerPanel,
} from "~/components/drawers/drawer";
import { AutosizeInput } from "~/components/input/autosize-input";
import {
  Step,
  Stepper,
  StepperLeftChevronNavigation,
  StepperRightChevronNavigation,
  StepsIndicator,
} from "~/components/stepper";
import { ModalBase } from "~/modals/base";
import type {
  IBasicDataFeed,
  LibrarySymbolInfo,
  ResolutionString,
} from "~/public/tradingview";
import { useNavBarStore } from "~/stores/nav-bar-store";

import animation from "../../../../web/components/cards/collect.json";

dayjs.extend(advancedFormat);
const symbol: LibrarySymbolInfo = {
  name: "SMOKE",
  ticker: "SMOKE",
  description: "Offline smoke bars",
  type: "crypto",
  session: "24x7",
  timezone: "Etc/UTC",
  exchange: "TEST",
  listed_exchange: "TEST",
  format: "price",
  minmov: 1,
  pricescale: 100,
  has_intraday: false,
  supported_resolutions: ["1D" as ResolutionString],
  volume_precision: 2,
  data_status: "endofday",
};
// Entirely in-memory: no RPC, HTTP, wallet discovery, adapter or transaction.
const datafeed: IBasicDataFeed = {
  onReady: (callback) =>
    setTimeout(
      () => callback({ supported_resolutions: symbol.supported_resolutions }),
      0
    ),
  searchSymbols: (_input, _exchange, _type, callback) => callback([]),
  resolveSymbol: (_name, callback) => setTimeout(() => callback(symbol), 0),
  getBars: (_symbol, _resolution, period, callback) => {
    document.body.dataset.feedBars = String(
      Number(document.body.dataset.feedBars || 0) + 1
    );
    const end = Math.floor(period.to / 86400) * 86400;
    const bars = Array.from({ length: 50 }, (_, i) => ({
      time: (end - (50 - i) * 86400) * 1000,
      open: 10,
      high: 14,
      low: 8,
      close: 12,
      volume: 20,
    }));
    setTimeout(() => callback(bars, { noData: false }), 0);
  },
  subscribeBars: () => {
    document.body.dataset.feedSubscribed = "true";
  },
  unsubscribeBars: () => {
    document.body.dataset.feedUnsubscribed = "true";
  },
};

function Singleton() {
  const [source, target] = useSingleton();
  const [second, setSecond] = useState(true);
  const buttonRef = useRef<HTMLButtonElement>(null);
  return (
    <>
      <Tippy singleton={source} content="" duration={0} />
      <Tippy singleton={target} content="First tip">
        <button ref={buttonRef}>First tip target</button>
      </Tippy>
      {second && (
        <Tippy singleton={target} content="Second tip">
          <button>Second tip target</button>
        </Tippy>
      )}
      <button onClick={() => setSecond(false)}>Remove second target</button>
    </>
  );
}

export default function Smoke() {
  const hydrated = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );
  const [value, setValue] = useState("1.25");
  const [modal, setModal] = useState(false);
  const [closed, setClosed] = useState(0);
  const [points, setPoints] = useState([
    { time: 1700000000000, close: 10 },
    { time: 1700086400000, close: 15 },
    { time: 1700172800000, close: 12 },
  ]);
  const [min, setMin] = useState(2);
  const [submitted, setSubmitted] = useState(0);
  const [hover, setHover] = useState(false);
  const [vendorLoaded, setVendorLoaded] = useState(false);
  const [vendor, setVendor] = useState(false);
  const banner = useNavBarStore((state) => state.visibleBannerHeight);
  const setBanner = useNavBarStore((state) => state.setVisibleBannerHeight);
  const lottie = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "/tradingview/charting_library.js";
    script.onload = () => setVendorLoaded(true);
    document.head.appendChild(script);
    return () => script.remove();
  }, []);
  return (
    <main data-testid="hydrated" data-ready={hydrated}>
      <h1>Local React {version} component smoke</h1>
      <section>
        <AutosizeInput
          aria-label="Decimal amount"
          value={value}
          onChange={(event) => setValue(event.target.value)}
          inputMode="decimal"
          autoComplete="off"
          autoCorrect="off"
          spellCheck={false}
          placeholder="0.00"
        />
        <button
          onClick={async () => {
            // Real asynchronously loaded local font, not a fake FontFaceSet event.
            const font = new FontFace(
              "SmokeFont",
              "url(/tradingview/bundles/EuclidCircular.be8f862db48c2976009f.woff2)"
            );
            document.fonts.add(font);
            document.querySelector<HTMLInputElement>(
              "input"
            )!.style.fontFamily = "SmokeFont, monospace";
            await font.load();
            await document.fonts.ready;
            document.body.dataset.fontLoaded = "true";
          }}
        >
          Load local font
        </button>
      </section>
      <section>
        <button onClick={() => setModal(true)}>Open modal</button>
        <output data-testid="closed">{closed}</output>
        <ModalBase
          title="Smoke modal"
          isOpen={modal}
          onRequestClose={() => setModal(false)}
          onAfterClose={() => setClosed((n) => n + 1)}
        >
          <button>Inside modal</button>
        </ModalBase>
      </section>
      <section className="relative h-[420px]">
        <Drawer>
          {({ onClose, isAnimationComplete }) => (
            <>
              <DrawerButton>Open drawer</DrawerButton>
              <DrawerPanel className="!h-[300px] !pb-0" data-testid="drawer">
                <DrawerContent>
                  <button>Drawer first</button>
                  <button onClick={onClose}>Close drawer</button>
                </DrawerContent>
                <output data-testid="drawer-settled">
                  {String(isAnimationComplete)}
                </output>
              </DrawerPanel>
            </>
          )}
        </Drawer>
      </section>
      <section>
        <Singleton />
      </section>
      <section>
        <Stepper>
          <Step>First slide</Step>
          <StepsIndicator />
          <Step>Second slide</Step>
          <StepperLeftChevronNavigation />
          <StepperRightChevronNavigation />
        </Stepper>
      </section>
      <section>
        <output data-testid="store">{banner}</output>
        <button onClick={() => setBanner(banner + 10)}>
          Update Zustand store
        </button>
      </section>
      <section>
        <button
          onClick={() =>
            setPoints(points.map((p) => ({ ...p, close: p.close / 2 })))
          }
        >
          Update chart
        </button>
        {hydrated && (
          <div data-testid="history" className="flex h-[240px] w-full">
            <HistoricalPriceChart
              data={points}
              domain={[0, 20]}
              annotations={[]}
              showTooltip
              onPointerHover={(price) => {
                document.body.dataset.chartHover = String(price);
              }}
              fiatSymbol="$"
            />
          </div>
        )}
        <output data-testid="drag-submitted">{submitted}</output>
        {hydrated && (
          <div data-testid="depth" className="flex h-[240px] w-full">
            <ConcentratedLiquidityDepthChart
              data={[
                { price: 2, depth: 3 },
                { price: 8, depth: 5 },
              ]}
              xRange={[0, 10]}
              yRange={[0, 10]}
              min={min}
              max={8}
              onMoveMin={(value) => {
                document.body.dataset.dragMoving = String(value);
              }}
              onSubmitMin={(value) => {
                setSubmitted(value);
                setMin(value);
              }}
            />
          </div>
        )}
      </section>
      <section>
        <div ref={lottie} data-testid="lottie-frame">
          <DynamicLottieAnimation
            data-testid="lottie"
            style={{ width: 300, height: 150 }}
            globalLottieFileKey="browser-collect"
            importFn={async () => animation}
            autoplay={hover}
            loop
            onMouseEnter={() => setHover(true)}
            onMouseLeave={() => setHover(false)}
            subscriptions={{
              ready: () => {
                if (lottie.current) lottie.current.dataset.frame = "0";
              },
              frame: ({ currentFrame }) => {
                if (lottie.current)
                  lottie.current.dataset.frame = String(currentFrame);
              },
            }}
          />
        </div>
      </section>
      <section>
        <button disabled={!vendorLoaded} onClick={() => setVendor(!vendor)}>
          Toggle vendor chart
        </button>
        {vendor && (
          <div data-testid="vendor" className="h-[480px]">
            <AdvancedChart
              coinDenom="SMOKE"
              datafeed={datafeed}
              custom_css_url="/smoke-vendor.css"
            />
          </div>
        )}
      </section>
    </main>
  );
}
