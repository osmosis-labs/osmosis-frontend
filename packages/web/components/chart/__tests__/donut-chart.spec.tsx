import { render } from "@testing-library/react";

import { DonutChart, donutLegendGradient } from "../donut-chart";

describe("DonutChart", () => {
  it("renders one segment per positive value", () => {
    const { container } = render(
      <DonutChart size={200} values={[50, 30, 20]} />
    );
    expect(container.querySelectorAll("path")).toHaveLength(3);
    expect(container.querySelectorAll("linearGradient")).toHaveLength(3);
  });

  it("skips zero and non-finite values", () => {
    const { container } = render(
      <DonutChart size={200} values={[1, 0, NaN, 3]} />
    );
    expect(container.querySelectorAll("path")).toHaveLength(2);
  });

  it("draws a single full segment as a non-degenerate arc", () => {
    const { container } = render(<DonutChart size={100} values={[1]} />);
    const d = container.querySelector("path")?.getAttribute("d") ?? "";
    expect(d).not.toContain("NaN");
    // large-arc flag set on both outer and inner arcs
    expect(d.match(/ 0 1 [01] /g)).toHaveLength(2);
  });

  it("keeps a segment thinner than the gap visible", () => {
    const { container } = render(<DonutChart size={200} values={[1000, 1]} />);
    const d = container.querySelectorAll("path")[1]?.getAttribute("d") ?? "";
    const [x1, y1, x2, y2] = (
      d.match(/^M (\S+) (\S+) A \S+ \S+ 0 [01] 1 (\S+) (\S+)/) ?? []
    )
      .slice(1)
      .map(Number);
    // 1/1001 of a 100px-radius ring is an arc of about 0.63px.
    expect(Math.hypot(x2 - x1, y2 - y1)).toBeGreaterThan(0.5);
  });

  it("renders nothing when there is no positive total", () => {
    const { container } = render(<DonutChart size={100} values={[0, 0]} />);
    expect(container.firstChild).toBeNull();
  });

  it("cycles legend gradients past the palette length", () => {
    expect(donutLegendGradient(4)).toBe(donutLegendGradient(0));
  });
});
