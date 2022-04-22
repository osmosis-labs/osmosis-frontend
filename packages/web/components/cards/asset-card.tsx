import Image from "next/image";
import { FunctionComponent } from "react";
import classNames from "classnames";
import { CustomClasses, Metric } from "../types";
import { PoolAssetInfo, PoolAssetsIcon } from "../assets";

// TODO: use truncateString to truncate ibc denoms w/ coinDenom config (overflow)

export const AssetCard: FunctionComponent<
  {
    coinDenom: string;
    coinImageUrl?: string | PoolAssetInfo[];
    coinDenomCaption?: string;
    metrics: Metric[];
    isSuperfluid?: boolean;
    onClick?: () => void;
  } & CustomClasses
> = ({
  coinDenom,
  coinImageUrl,
  coinDenomCaption,
  metrics,
  isSuperfluid = false,
  onClick,
  className,
}) => (
  <div
    className={classNames(
      "w-full p-px rounded-lg",
      {
        "bg-white-full/30": !isSuperfluid,
        "bg-superfluid": isSuperfluid,
      },
      className
    )}
    onClick={() => onClick?.()}
  >
    <div className="flex items-center place-content-between p-4 w-full bg-card rounded-lginset">
      <div className="flex items-center gap-3">
        {coinImageUrl &&
          (Array.isArray(coinImageUrl) ? (
            <PoolAssetsIcon assets={coinImageUrl} size="sm" />
          ) : (
            <div className="w-[2.125rem] h-[2.125rem] rounded-full border border-enabledGold shrink-0 flex items-center justify-center">
              <Image alt="asset" src={coinImageUrl} height={28} width={28} />
            </div>
          ))}
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
          {metrics.map(({ label, value }, index) => (
            <span
              key={index}
              className={
                index === 0 ? "subtitle2" : "caption text-white-disabled"
              }
            >
              {value} {label}
            </span>
          ))}
        </div>
        {onClick !== undefined && (
          <Image
            alt="right"
            src="/icons/chevron-right.svg"
            height={10}
            width={10}
          />
        )}
      </div>
    </div>
  </div>
);
