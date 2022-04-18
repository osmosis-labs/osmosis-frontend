import Image from "next/image";
import { FunctionComponent } from "react";
import classNames from "classnames";
import { CustomClasses, Metric } from "../types";

export const AssetCard: FunctionComponent<
  {
    coinDenom: string;
    coinImageUrl?: string;
    coinDenomCaption?: string;
    metrics: Metric[];
    onClick: () => void;
  } & CustomClasses
> = ({
  coinDenom,
  coinImageUrl,
  coinDenomCaption,
  metrics,
  onClick,
  className,
}) => (
  <div
    className={classNames(
      "flex items-center place-content-between w-full p-4 border border-white-full/20 rounded-lg",
      className
    )}
    onClick={onClick}
  >
    <div className="flex items-center gap-3">
      {coinImageUrl && (
        <div className="w-[2.125rem] h-[2.125rem] rounded-full border border-enabledGold shrink-0 flex items-center justify-center">
          <Image alt="asset" src={coinImageUrl} height={28} width={28} />
        </div>
      )}
      <div className="flex flex-col gap-0.5">
        <span className="button">{coinDenom}</span>
        {coinDenomCaption && (
          <span className="caption text-white-disabled">
            {coinDenomCaption}
          </span>
        )}
      </div>
    </div>
    <div className="flex items-center gap-2.5">
      <div className="flex flex-col gap-px text-right">
        {metrics.map((metric, index) => (
          <span
            key={index}
            className={
              index === 0 ? "subtitle2" : "caption text-white-disabled"
            }
          >
            {metric.value}
          </span>
        ))}
      </div>
      <Image
        alt="right"
        src="/icons/chevron-right.svg"
        height={10}
        width={10}
      />
    </div>
  </div>
);
