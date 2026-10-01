import type { Options } from "highcharts";
import dynamic from "next/dynamic";
import React, { FunctionComponent, useEffect, useMemo, useState } from "react";

const HighchartsReact = dynamic(() => import("highcharts-react-official"), {
  ssr: false,
});

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
    enabled: false,
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

export const PieChart: FunctionComponent<{
  height?: number;
  width?: number;
  options: Options;
}> = (props) => {
  const options = useMemo<Partial<Options>>(() => {
    const chart = {
      ...defaultOptions.chart,
      ...props.options.chart,
    };

    if (props.height && props.width) {
      chart.height = props.height;
      chart.width = props.width;
    }

    return { ...defaultOptions, ...props.options, chart };
  }, [props.height, props.options, props.width]);

  const [hc, setHc] = useState<any | null>(null);
  useEffect(() => {
    import("highcharts").then((hc) => setHc(hc));
  }, []);

  return hc ? <HighchartsReact highcharts={hc} options={options} /> : null;
};
