import classNames from "classnames";
import { useMemo } from "react";
import { useRef } from "react";
import { useScroll } from "react-use";

import { useTranslation } from "~/hooks";
import useScrollMeasure from "~/hooks/use-scroll-measure";

const mockTokenRows = [
  {
    image: "",
    name: "ATOM",
    perc: 23.87,
  },
  {
    image: "",
    name: "OSMO",
    perc: 22.87,
  },
  {
    image: "",
    name: "MARS",
    perc: 18.87,
  },
  {
    image: "",
    name: "ETH",
    perc: 13.87,
  },
  {
    image: "",
    name: "ATOM",
    perc: 23.87,
  },
  {
    image: "",
    name: "OSMO",
    perc: 22.87,
  },
  {
    image: "",
    name: "MARS",
    perc: 18.87,
  },
  {
    image: "",
    name: "ETH",
    perc: 13.87,
  },
  {
    image: "",
    name: "ATOM",
    perc: 23.87,
  },
  {
    image: "",
    name: "OSMO",
    perc: 22.87,
  },
  {
    image: "",
    name: "MARS",
    perc: 18.87,
  },
  {
    image: "",
    name: "ETH",
    perc: 13.87,
  },
];

export const EarnAllocation = () => {
  const containerRef = useRef(null);
  const { measure } = useScrollMeasure(containerRef);
  const { y } = useScroll(containerRef);
  const { t } = useTranslation();

  const hasReachedBottom = useMemo(
    () => y + measure.offsetHeight < measure.scrollHeight - 10,
    [measure.offsetHeight, measure.scrollHeight, y]
  );

  return (
    <div className="flex flex-col gap-7 1.5xl:flex-1">
      <div className="flex items-center gap-3.5">
        <h5 className="text-lg font-semibold leading-normal text-osmoverse-100 1.5xl:hidden">
          {t("earnPage.allocation")}
        </h5>
        <p className="text-sm font-semibold text-wosmongton-300">5 tokens</p>
      </div>
      <div className="relative flex flex-col justify-between gap-12">
        <div className="flex gap-4">
          <button className="text-sm font-semibold text-osmoverse-100">
            {t("pools.createPool.token")}
          </button>
          <button className="text-sm font-semibold text-osmoverse-100 opacity-50">
            {t("earnPage.method")}
          </button>
          <button className="text-sm font-semibold text-osmoverse-100 opacity-50">
            {t("earnPage.platform")}
          </button>
        </div>
        <div
          ref={containerRef}
          className={classNames(
            "no-scrollbar flex max-h-48 flex-col gap-4 overflow-scroll before:pointer-events-none before:absolute before:inset-x-0 before:top-9 before:bottom-0 before:bg-gradient-scrollable-allocation-list-reverse before:transition-opacity before:duration-200 before:ease-in-out after:pointer-events-none after:absolute after:inset-x-0 after:-bottom-0.25 after:top-56 after:bg-gradient-scrollable-allocation-list after:transition-opacity after:duration-200 after:ease-in-out",
            {
              "before:opacity-100": y > 10,
              "before:opacity-0": y < 10,
              "after:opacity-100": hasReachedBottom,
              "after:opacity-0": !hasReachedBottom,
            }
          )}
        >
          {mockTokenRows.map(({ name, perc }, i) => (
            <div
              key={`${name} ${i} stat row`}
              className="flex items-center justify-between"
            >
              <div className="flex items-center gap-4">
                <div className="h-8 w-8 rounded-full bg-osmoverse-400" />
                <p className="font-subtitle1 text-osmoverse-100">{name}</p>
              </div>
              <div className="flex items-center gap-4">
                <p className="font-semibold text-osmoverse-100">{perc}%</p>
                <div className="h-8 w-8 rounded-full bg-wosmongton-500" />
              </div>
            </div>
          ))}
        </div>
        <small
          className={classNames(
            "absolute bottom-0 inline-flex w-full justify-center self-center text-overline font-subtitle2 font-medium tracking-normal text-osmoverse-300 transition-opacity duration-200 ease-in-out",
            { "opacity-0": y > 10 },
            { "opacity-50": y < 10 }
          )}
        >
          {t("earnPage.scrollToSeeMore")}
        </small>
      </div>
    </div>
  );
};
