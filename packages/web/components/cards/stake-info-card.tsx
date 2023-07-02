import classNames from "classnames";
import Image from "next/image";
import React from "react";
import { useTranslation } from "react-multi-lang";

import { useWindowSize } from "~/hooks";

import { Button } from "../buttons";
import { OsmoverseCard } from "./osmoverse-card";

const OSMO_IMG_URL = "/tokens/osmo.svg";

export const StakeInfoCard = () => {
  const t = useTranslation();
  const isMobile = useWindowSize();
  const outAmountValue = "1,917,227";
  const inAmountValue = "3763470";
  return (
    <OsmoverseCard>
      <div className="flex place-content-between items-center transition-opacity">
        <div className="flex">
          <span className="caption text-sm text-white-full md:text-xs">
            {t("stake.available")}
          </span>
          <span className="caption ml-1.5 text-sm text-wosmongton-300 md:text-xs">
            10,000 OSMO
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <Button
            mode="amount"
            className="py-1 px-1.5 text-xs"
            onClick={() => {
              console.log("clicked the half");
            }}
          >
            {t("swap.HALF")}
          </Button>
          <Button
            mode="amount"
            className="py-1 px-1.5 text-xs"
            onClick={() => {
              console.log("clicked the whole");
            }}
          >
            {t("stake.MAX")}
          </Button>
        </div>
      </div>
      <div className="flex items-center gap-2 py-3 px-2 text-left">
        <div className="mr-1 flex h-[50px] w-[50px] shrink-0 overflow-hidden rounded-full md:h-7 md:w-7">
          <Image
            src={OSMO_IMG_URL}
            alt="osmosis icon"
            width={isMobile ? 30 : 50}
            height={isMobile ? 30 : 50}
          />
        </div>
        <div className="flex flex-col">
          <div className="flex items-center">
            {isMobile ? <span className="subtitle1">OSMO</span> : <h5>OSMO</h5>}
          </div>
          <div className="subtitle2 md:caption w-32 text-osmoverse-400">
            Osmosis
          </div>
        </div>
        <div className="flex w-full flex-col items-end">
          <h5
            className={classNames(
              "md:subtitle1 text-right",
              inAmountValue ? "text-white-full" : "text-white-disabled"
            )}
          >
            {inAmountValue}
          </h5>
          <div
            className={classNames(
              "subtitle1 md:caption text-osmoverse-300 transition-opacity",
              outAmountValue ? "opacity-100" : "opacity-0"
            )}
          >
            {`≈ $ ${outAmountValue || "0"}`}
          </div>
        </div>
      </div>
    </OsmoverseCard>
  );
};
