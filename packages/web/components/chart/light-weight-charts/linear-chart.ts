import {
  AreaData,
  MouseEventParams,
  Time,
  TimeChartOptions,
} from "lightweight-charts";

import { AreaChartController } from "./area-chart";
import { ChartControllerParams } from "./chart";

export class LinearChartController extends AreaChartController {
  tooltip: HTMLDivElement;

  constructor(params: ChartControllerParams<TimeChartOptions, Time>) {
    super(params);

    this.tooltip = document.createElement("div");
    this.tooltip.style.borderRadius = "20px";
    this.tooltip.style.background = "black";
    this.tooltip.style.color = "white";
    this.tooltip.style.padding = "20px";
    this.tooltip.style.position = "absolute";
    this.tooltip.style.display = "none";
    this.tooltip.style.pointerEvents = "none";
    this.tooltip.style.zIndex = "9999";

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

      const [_, secondSeriesData] = dataSeries;

      const content = dataSeries
        .map((series) => {
          const seriesData = series.value as AreaData;

          return `
            <div>
              <h6>
                <span>${secondSeriesData ? "$" : ""}</span>
                <span>${seriesData.value}</span>
              </h6>
            </div>
          `;
        })
        .join("");

      const toolTipWidth = secondSeriesData ? 180 : 90;
      const toolTipHeight = 64;
      const toolTipMargin = 15;

      this.tooltip.innerHTML = `<div>
          ${content}
        </div>
        `;

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
