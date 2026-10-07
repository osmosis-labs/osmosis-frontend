import { act, fireEvent, render, waitFor } from "@testing-library/react";
import type { LottieProps } from "lottie-react";
import type { AnimationConfigWithData, AnimationItem } from "lottie-web";
import { ComponentType, StrictMode, useState } from "react";
import { renderToString } from "react-dom/server";

import { DynamicLottieAnimation } from "../dynamic-lottie-animation";

// Exercise the real lottie-react v3 component; mock only its drawing engine.
jest.mock("lottie-web", () => ({
  loadAnimation: jest.fn(),
  setIDPrefix: jest.fn(),
}));
jest.mock("lottie-web/build/player/lottie_svg.js", () => ({}));
jest.mock("lottie-web/build/player/lottie_light.js", () => ({}));

// Honor the production dynamic loader, without Next's preload machinery.
jest.mock("next/dynamic", () => {
  const { lazy, Suspense } = jest.requireActual("react");
  return jest.fn(
    (
      loader: () => Promise<ComponentType<LottieProps>>,
      options: { ssr: boolean }
    ) => {
      expect(options.ssr).toBe(false);
      const Component = lazy(() =>
        loader().then((component) => ({ default: component }))
      );
      return function Dynamic(props: object) {
        return (
          <Suspense fallback={null}>
            <Component {...props} />
          </Suspense>
        );
      };
    }
  );
});

const { loadAnimation } = jest.requireMock("lottie-web") as jest.Mocked<
  typeof import("lottie-web").default
>;
const animations: Array<{
  destroy: jest.Mock;
  removeEventListener: jest.Mock;
}> = [];

beforeEach(() => {
  loadAnimation.mockReset();
  animations.length = 0;
  Object.defineProperty(window, "matchMedia", {
    configurable: true,
    value: jest.fn(() => ({ matches: false })),
  });
  loadAnimation.mockImplementation((config) => {
    const item = {
      destroy: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      setSpeed: jest.fn(),
      setDirection: jest.fn(),
      loop: config.loop,
      isPaused: !config.autoplay,
    };
    animations.push(item);
    return item as unknown as AnimationItem;
  });
});

const data = { v: "5.7.4", fr: 30, ip: 0, op: 30, w: 100, h: 100, layers: [] };

it("unwraps JSON modules, preserves playback defaults and DOM props, and cleans up", async () => {
  const importFn = jest.fn().mockResolvedValue({ default: data });
  const onMouseEnter = jest.fn();
  const { container, unmount } = render(
    <StrictMode>
      <DynamicLottieAnimation
        globalLottieFileKey="defaults"
        importFn={importFn}
        className="animation-size"
        onMouseEnter={onMouseEnter}
      />
    </StrictMode>
  );
  await waitFor(() => expect(loadAnimation).toHaveBeenCalled());
  expect(loadAnimation).toHaveBeenLastCalledWith(
    expect.objectContaining({ animationData: data, autoplay: true, loop: true })
  );
  const display = container.querySelector(".animation-size")!;
  fireEvent.mouseEnter(display);
  expect(onMouseEnter).toHaveBeenCalled();
  unmount();
  for (const item of animations) {
    expect(item.destroy).toHaveBeenCalledTimes(1);
    expect(item.removeEventListener).toHaveBeenCalled();
  }
  // The checked-in wrapper still caches a loaded animation by global key.
  importFn.mockClear();
  const previousLoads = loadAnimation.mock.calls.length;
  render(
    <DynamicLottieAnimation
      globalLottieFileKey="defaults"
      importFn={importFn}
    />
  );
  await waitFor(() =>
    expect(loadAnimation.mock.calls.length).toBeGreaterThan(previousLoads)
  );
  expect(importFn).not.toHaveBeenCalled();
});

it("passes explicit playback options and follows the rewards-card hover pattern", async () => {
  function RewardsAnimation() {
    const [hover, setHover] = useState(false);
    return (
      <DynamicLottieAnimation
        globalLottieFileKey="hover"
        importFn={() => Promise.resolve(data)}
        autoplay={hover}
        loop={false}
        className="hover-animation"
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
      />
    );
  }
  const { container, unmount } = render(<RewardsAnimation />);
  await waitFor(() => expect(loadAnimation).toHaveBeenCalled());
  expect(loadAnimation).toHaveBeenLastCalledWith(
    expect.objectContaining({ autoplay: false, loop: false })
  );
  fireEvent.mouseEnter(container.querySelector(".hover-animation")!);
  await waitFor(() =>
    expect(loadAnimation).toHaveBeenLastCalledWith(
      expect.objectContaining({ autoplay: true, loop: false })
    )
  );
  fireEvent.mouseLeave(container.querySelector(".hover-animation")!);
  await waitFor(() =>
    expect(loadAnimation).toHaveBeenLastCalledWith(
      expect.objectContaining({ autoplay: false, loop: false })
    )
  );
  unmount();
  animations.forEach((item) => expect(item.destroy).toHaveBeenCalledTimes(1));
});

it("waits for JSON and ignores a late import after its key changes or it unmounts", async () => {
  let resolveOld!: (module: object) => void;
  const oldImport = new Promise<object>((resolve) => {
    resolveOld = resolve;
  });
  const { rerender, unmount } = render(
    <DynamicLottieAnimation
      globalLottieFileKey="old-pending"
      importFn={() => oldImport}
    />
  );
  expect(loadAnimation).not.toHaveBeenCalled();
  const nextData = { ...data, nm: "next" };
  rerender(
    <DynamicLottieAnimation
      globalLottieFileKey="new-key"
      importFn={() => Promise.resolve({ default: nextData })}
    />
  );
  await waitFor(() => expect(loadAnimation).toHaveBeenCalled());
  await act(async () => resolveOld({ default: data }));
  expect(
    (loadAnimation.mock.calls.at(-1)![0] as AnimationConfigWithData)
      .animationData
  ).toEqual(nextData);
  unmount();
  loadAnimation.mockClear();
  let resolveUnmounted!: (module: object) => void;
  const pending = new Promise<object>((resolve) => {
    resolveUnmounted = resolve;
  });
  const view = render(
    <DynamicLottieAnimation
      globalLottieFileKey="unmounted-pending"
      importFn={() => pending}
    />
  );
  view.unmount();
  await act(async () => resolveUnmounted({ default: data }));
  expect(loadAnimation).not.toHaveBeenCalled();
});

it("does not import animation data or mount a player during SSR", () => {
  const importFn = jest.fn().mockResolvedValue(data);
  expect(
    renderToString(
      <DynamicLottieAnimation globalLottieFileKey="ssr" importFn={importFn} />
    )
  ).toBe("");
  expect(importFn).not.toHaveBeenCalled();
  expect(loadAnimation).not.toHaveBeenCalled();
});

it("honors the new player's reduced-motion autoplay guard", async () => {
  jest
    .mocked(window.matchMedia)
    .mockReturnValue({ matches: true } as MediaQueryList);
  const warning = jest.spyOn(console, "warn").mockImplementation(() => {});
  try {
    render(
      <DynamicLottieAnimation
        globalLottieFileKey="reduced-motion"
        importFn={() => Promise.resolve(data)}
      />
    );
    await waitFor(() => expect(loadAnimation).toHaveBeenCalled());
    expect(loadAnimation).toHaveBeenLastCalledWith(
      expect.objectContaining({ autoplay: false, loop: true })
    );
  } finally {
    warning.mockRestore();
  }
});
