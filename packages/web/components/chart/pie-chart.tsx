import type { Options } from "highcharts";
import Highcharts from "highcharts";
import HighchartsExporting from "highcharts/modules/exporting";
import dynamic from "next/dynamic";
import React, { FunctionComponent, useEffect, useState } from "react";

const defaultOptions: Partial<Options> = {
  chart: {
    type: "pie",
    style: {
      filter: "alpha(opacity=10)",
      opacity: 10,
      fill: "transparent",
      background: "transparent",
    },
    margin: [0, 0, 0, 0],
    spacing: [0, 0, 0, 0],
    height: 200,
    width: 200,
  },
  xAxis: {
    type: "datetime",
    maxPadding: 0,
    minPadding: 0,
    margin: 0,
  },
  yAxis: {
    maxPadding: 0,
    minPadding: 0,
    margin: 0,
  },
  tooltip: {
    pointFormatter: function () {
      return `<p>${
        this.x
      }<span style='font-size: 10px;'>${this.name.toUpperCase()}</span> / ${
        this.y
      }%</p>`;
    },
  },
  title: {
    text: undefined,
  },
  subtitle: {
    text: undefined,
  },
  accessibility: {
    announceNewData: {
      enabled: true,
    },
    point: {
      valueSuffix: "%",
    },
  },
  credits: {
    enabled: false,
  },
  plotOptions: {
    pie: {
      borderColor: "transparent",
    },
  },
};

const HighchartsReact = dynamic(
  () => import("highcharts-react-official").then((mod) => mod.HighchartsReact),
  {
    ssr: false,
  }
);

export const PieChart: FunctionComponent<{
  height?: number;
  width?: number;
  options: Options;
}> = (props) => {
  // known issue with highcharts and next, fix from their documentation
  // npmjs.com/package/highcharts-react-official#highcharts-with-nextjs
  if (typeof Highcharts === "object") {
    HighchartsExporting(Highcharts);
  }

  const [options, setOptions] = useState<Partial<Options>>(defaultOptions);
  useEffect(() => {
    if (!props.options) return;
    setOptions((v) => {
      if (props.height && props.width) {
        v.chart = { ...v.chart, height: props.height, width: props.width };
      }
      return { ...v, ...props.options };
    });
  }, [props.options, props.height, props.width]);

  const [hc, setHc] = useState<any | null>(null);
  useEffect(() => {
    import("highcharts").then((hc) => setHc(hc));
  }, []);

  return hc ? <HighchartsReact highcharts={hc} options={options} /> : null;
};
