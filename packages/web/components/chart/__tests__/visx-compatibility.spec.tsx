import { fireEvent, render, waitFor } from "@testing-library/react";
import { TooltipContext } from "@visx/xychart";
import React, { StrictMode } from "react";

import { ConcentratedLiquidityDepthChart } from "../concentrated-liquidity-depth";
import { HistoricalPriceChart } from "../price-historical";

// Keep app/store setup out of these real Visx + Spring runtime tests.
jest.mock("mobx-react-lite", () => ({
  observer: (component: unknown) => component,
}));
jest.mock("~/hooks", () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));
jest.mock("~/components/loaders/skeleton-loader", () => ({
  SkeletonLoader: () => null,
}));
jest.mock("~/components/ui/button", () => ({ ChartButton: () => null }));
jest.mock("~/utils/formatter", () => ({
  compressZeros: jest.fn(),
  formatPretty: () => "12.00",
  getPriceExtendedFormatOptions: () => ({}),
}));
jest.mock("~/utils/number", () => ({ getDecimalCount: () => 2 }));

const data = [
  { time: 1000, close: 10 },
  { time: 2000, close: 15 },
  { time: 3000, close: 12 },
];

// jsdom has no layout/ResizeObserver. Supply dimensions, not mocked charts.
class ChartResizeObserver {
  constructor(private callback: ResizeObserverCallback) {}
  observe(target: Element) {
    this.callback(
      [
        {
          target,
          contentRect: target.getBoundingClientRect(),
        } as ResizeObserverEntry,
      ],
      this as unknown as ResizeObserver
    );
  }
  unobserve() {}
  disconnect() {}
}

let originalResizeObserver: typeof ResizeObserver;
beforeEach(() => {
  originalResizeObserver = window.ResizeObserver;
  window.ResizeObserver =
    ChartResizeObserver as unknown as typeof ResizeObserver;
  jest.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(null);
  jest
    .spyOn(Element.prototype, "getBoundingClientRect")
    .mockImplementation(function () {
      const tooltip = this.classList.contains("visx-tooltip");
      return {
        x: 0,
        y: 0,
        left: 0,
        top: 0,
        width: tooltip ? 100 : 400,
        height: tooltip ? 40 : 240,
        right: tooltip ? 100 : 400,
        bottom: tooltip ? 40 : 240,
        toJSON: () => ({}),
      };
    });
});
afterEach(() => {
  window.ResizeObserver = originalResizeObserver;
  jest.restoreAllMocks();
});

it.each([true, false])(
  "updates an animated historical %s-gradient series in StrictMode",
  async (showGradient) => {
    const chart = (points: typeof data) => (
      <StrictMode>
        <HistoricalPriceChart
          data={points}
          domain={[0, 20]}
          annotations={[]}
          showGradient={showGradient}
        />
      </StrictMode>
    );
    const { container, rerender } = render(chart(data));
    const pathSelector = showGradient ? ".visx-area" : ".visx-path";
    await waitFor(() =>
      expect(container.querySelector(pathSelector)?.getAttribute("d")).toMatch(
        /^M/
      )
    );
    const initialPath = container
      .querySelector(pathSelector)!
      .getAttribute("d");
    // Same number of points: exercise Spring's path interpolation, not a remount.
    rerender(
      chart(data.map((datum) => ({ ...datum, close: datum.close / 2 })))
    );
    await waitFor(() =>
      expect(container.querySelector(pathSelector)!.getAttribute("d")).not.toBe(
        initialPath
      )
    );
    expect(
      container
        .querySelector("svg[aria-label='XYChart']")
        ?.getAttribute("width")
    ).toBe("400");
  }
);

it("keeps compact axes visible through Visx 4's measurement wrapper", async () => {
  const { container, rerender } = render(
    <HistoricalPriceChart
      data={data}
      domain={[0, 20]}
      annotations={[]}
      minimal
    />
  );
  await waitFor(() =>
    expect(container.querySelector("svg[aria-label='XYChart']")).not.toBeNull()
  );
  const outer = container.firstElementChild!;
  expect(outer.classList.contains("[&>div]:!overflow-visible")).toBe(true);
  expect(outer.classList.contains("[&>div>svg]:overflow-visible")).toBe(true);
  expect(
    outer.firstElementChild?.querySelector("svg[aria-label='XYChart']")
  ).not.toBeNull();
  rerender(
    <HistoricalPriceChart data={data} domain={[0, 20]} annotations={[]} />
  );
  expect(outer.classList.contains("overflow-hidden")).toBe(true);
  expect(outer.classList.contains("[&>div]:!overflow-visible")).toBe(false);
});

it("measures and flips the bounded historical tooltip using a DOM ref", async () => {
  const nearestDatum = { key: "close", index: 2, datum: data[2], distance: 0 };
  render(
    <StrictMode>
      <TooltipContext.Provider
        value={{
          tooltipOpen: true,
          tooltipLeft: 390,
          tooltipTop: 230,
          tooltipData: { nearestDatum, datumByKey: { close: nearestDatum } },
          showTooltip: jest.fn(),
          hideTooltip: jest.fn(),
          updateTooltip: jest.fn(),
        }}
      >
        <HistoricalPriceChart
          data={data}
          domain={[0, 20]}
          annotations={[]}
          showTooltip
          fiatSymbol="$"
        />
      </TooltipContext.Provider>
    </StrictMode>
  );
  await waitFor(() => {
    const tooltip = document.querySelector<HTMLElement>(
      ".visx-tooltip:not(.visx-crosshair):not(.visx-tooltip-glyph)"
    );
    expect(tooltip?.textContent).toContain("$12.00");
    expect(tooltip?.style.transform).toBe("translate(280px, 180px)");
  });
});

it("renders depth bars and submits an editable range annotation", async () => {
  const onMoveMin = jest.fn();
  const onSubmitMin = jest.fn();
  const { container } = render(
    <StrictMode>
      <ConcentratedLiquidityDepthChart
        data={[
          { price: 2, depth: 3 },
          { price: 8, depth: 5 },
        ]}
        xRange={[0, 10]}
        yRange={[0, 10]}
        min={2}
        max={8}
        onMoveMin={onMoveMin}
        onSubmitMin={onSubmitMin}
      />
    </StrictMode>
  );
  await waitFor(() =>
    expect(container.querySelectorAll(".visx-bar")).toHaveLength(2)
  );
  const handle = container.querySelector("circle[cursor='grab']")!;
  expect(handle).not.toBeNull();
  // y=192 corresponds to min=2; dragging up 24px selects min=3.
  fireEvent.mouseDown(handle, { clientX: 400, clientY: 192 });
  fireEvent.mouseMove(handle, { clientX: 400, clientY: 168 });
  fireEvent.mouseUp(handle, { clientX: 400, clientY: 168 });
  expect(onMoveMin).toHaveBeenCalledTimes(1);
  expect(onSubmitMin).toHaveBeenCalledTimes(1);
  expect(onMoveMin.mock.calls[0][0]).toBeCloseTo(3);
  expect(onSubmitMin.mock.calls[0][0]).toBeCloseTo(3);
});
