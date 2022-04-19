import * as Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import React, { FunctionComponent, useState, useEffect } from "react";

const defaultOptions: Partial<Highcharts.Options> = {
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

export const PieChart: FunctionComponent<
  HighchartsReact.Props & { height?: number; width?: number }
> = (props) => {
  const [options, setOptions] =
    useState<Partial<Highcharts.Options>>(defaultOptions);
  useEffect(() => {
    if (!props.options) return;
    setOptions((v) => {
      if (props.height && props.width) {
        v.chart = { ...v.chart, height: props.height, width: props.width };
      }
      return { ...v, ...props.options };
    });
  }, [props.options, props.height, props.width]);
  return <HighchartsReact highcharts={Highcharts} options={options} />;
};
