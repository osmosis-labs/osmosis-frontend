import { Dec } from "@keplr-wallet/unit";
import {
  AreaData,
  MouseEventParams,
  Time,
  TimeChartOptions,
} from "lightweight-charts";

import { formatPretty, getPriceExtendedFormatOptions } from "~/utils/formatter";
import { getDecimalCount } from "~/utils/number";

import { AreaChartController } from "./area-chart";
import { ChartControllerParams } from "./chart-controller";

export class LinearChartController extends AreaChartController {
  tooltip: HTMLDivElement;

  constructor(params: ChartControllerParams<TimeChartOptions, Time>) {
    super(params);

    this.tooltip = document.createElement("div");
    this.tooltip.className =
      "rounded-xl bg-osmoverse-1000 absolute hidden p-2 left-3 top-3 pointer-events-none z-[1000] drop-shadow-xl";

    params.container.appendChild(this.tooltip);

    this.events.on("remove", () => {
      this.tooltip.remove();
    });

    this.events.on("crosshairMove", this.crosshairMove.bind(this));
  }

  crosshairMove(param: MouseEventParams<Time>) {
    if (
      param.point === undefined ||
      !param.time ||
      param.point.x < 0 ||
      param.point.x > this.params.container.clientWidth ||
      param.point.y < 0 ||
      param.point.y > this.params.container.clientHeight
    ) {
      this.tooltip.style.display = "none";
    } else {
      this.tooltip.style.display = "block";

      const dataSeries = Array.from(param.seriesData, ([key, value]) => ({
        key,
        value,
      }));

      const content = dataSeries
        .map((series) => {
          const seriesData = series.value as AreaData;
          const close = seriesData.value;

          const minimumDecimals = 2;
          const maxDecimals = Math.max(getDecimalCount(close), minimumDecimals);

          const closeDec = new Dec(close);

          const formatOpts = getPriceExtendedFormatOptions(closeDec);

          return `
            <h6 class="text-h6 font-semibold text-white-full whitespace-nowrap">
              ${
                formatPretty(closeDec, {
                  maxDecimals,
                  currency: "USD",
                  style: "currency",
                  ...formatOpts,
                }) || ""
              }
            </h6>
          `;
        })
        .join("");

      const toolTipWidth = 90;
      const toolTipHeight = 64;
      const toolTipMargin = 15;

      this.tooltip.innerHTML = `<div class="flex flex-row gap-6">${content}</div>`;

      const y = param.point.y;
      let left = param.point.x + toolTipMargin;
      if (left > this.params.container.clientWidth - toolTipWidth) {
        left = param.point.x - toolTipMargin - toolTipWidth;
      }

      let top = y + toolTipMargin;

      if (top > this.params.container.clientHeight - toolTipHeight) {
        top = y - toolTipHeight - toolTipMargin;
      }

      this.tooltip.style.left = left + "px";
      this.tooltip.style.top = top + "px";
    }
  }
}
