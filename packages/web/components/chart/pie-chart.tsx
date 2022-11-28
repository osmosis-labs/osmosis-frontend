import dynamic from "next/dynamic";
import type { Options } from "highcharts";
import React, { FunctionComponent, useState, useEffect } from "react";
import type { CompletePieSvgProps } from "@nivo/pie";

const Pie = dynamic(() => import("@nivo/pie").then((mod) => mod.Pie), {
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

type BaseDatum = { id: string; label: string; color: string };

export const PieChart = <Datum extends BaseDatum>(
  props: Partial<CompletePieSvgProps<Datum>> & {
    data: CompletePieSvgProps<Datum>["data"];
  }
) => {
  return (
    <Pie
      innerRadius={0.8}
      cornerRadius={45}
      /** @ts-ignore */
      colors={{ datum: "data.color" }}
      /** @ts-ignore */
      tooltip={({ datum }) => <PieTooltip {...(datum as BaseDatum)} />}
      motionConfig="wobbly"
      padAngle={2.5}
      enableArcLabels={false}
      enableArcLinkLabels={false}
      activeOuterRadiusOffset={4}
      margin={{ top: 6, right: 6, bottom: 6, left: 6 }}
      {...props}
      width={props?.width ?? 200}
      height={props?.height ?? 200}
    />
  );
};

const PieTooltip: FunctionComponent<BaseDatum> = ({ label }) => {
  return <div className="bg-osmoverse-800 px-3 py-2 rounded-md">{label}</div>;
};
