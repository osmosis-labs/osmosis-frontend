import Link from "next/link";
import React from "react";

import { Icon } from "~/components/assets";
import { Data, DoubleTokenChart } from "~/components/chart/double-token-chart";

const data1: Data[] = [
  { time: 1700855000000, close: 0.67321876, denom: "OSMO" },
  { time: 1700855300000, close: 0.61487231, denom: "OSMO" },
  { time: 1700855600000, close: 0.64198742, denom: "OSMO" },
  { time: 1700855900000, close: 0.65654321, denom: "OSMO" },
  { time: 1700856200000, close: 0.65541234, denom: "OSMO" },
  { time: 1700856500000, close: 0.65412345, denom: "OSMO" },
  { time: 1700856800000, close: 0.65234567, denom: "OSMO" },
  { time: 1700857100000, close: 0.69765432, denom: "OSMO" },
  { time: 1700857400000, close: 0.65498765, denom: "OSMO" },
  { time: 1700857700000, close: 0.65587654, denom: "OSMO" },
  { time: 1700858000000, close: 0.65654321, denom: "OSMO" },
];

const data2: Data[] = [
  { time: 1700855000000, close: 0.65321876, denom: "OSMO" },
  { time: 1700855300000, close: 0.65487231, denom: "OSMO" },
  { time: 1700855600000, close: 0.65198742, denom: "OSMO" },
  { time: 1700855900000, close: 0.65654321, denom: "OSMO" },
  { time: 1700856200000, close: 0.65541234, denom: "OSMO" },
  { time: 1700856500000, close: 0.65412345, denom: "OSMO" },
  { time: 1700856800000, close: 0.65234567, denom: "OSMO" },
  { time: 1700857100000, close: 0.65765432, denom: "OSMO" },
  { time: 1700857400000, close: 0.65498765, denom: "OSMO" },
  { time: 1700857700000, close: 0.65587654, denom: "OSMO" },
  { time: 1700858000000, close: 0.65654321, denom: "OSMO" },
];

export const ChartSection = () => {
  return (
    <section className="w-full overflow-hidden">
      <header className="flex w-full justify-between p-8">
        <div className="flex items-center gap-16">
          <div className="flex flex-col gap-1">
            <Link
              href={`/assets/${"OSMO"}`}
              className="inline-flex items-center gap-1"
            >
              <h6 className="text-wosmongton-200">OSMO</h6>
              <Icon id="chevron-right" color="#B3B1FD" className="h-4 w-4" />
            </Link>
            <h4>$1.51</h4>
            <span className="text-subititle1 text-bullish-500">↗️ 10.28%</span>
          </div>
          <div className="flex flex-col gap-1">
            <Link
              href={`/assets/${"ATOM"}`}
              className="inline-flex items-center gap-1"
            >
              <h6 className="text-wosmongton-200">ATOM</h6>
              <Icon id="chevron-right" color="#B3B1FD" className="h-4 w-4" />
            </Link>
            <h4>$10.12</h4>
            <span className="text-subititle1 text-bullish-500">↗️ 7.71%</span>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button className="text-caption text-osmoverse-400">1H</button>
          <button className="text-caption text-osmoverse-400">1D</button>
          <button className="text-caption text-osmoverse-400">7D</button>
          <button className="text-caption text-osmoverse-400">30D</button>
          <button className="text-caption text-osmoverse-400">1Y</button>
        </div>
      </header>
      <DoubleTokenChart height={336} data1={data1} data2={data2} />
    </section>
  );
};
