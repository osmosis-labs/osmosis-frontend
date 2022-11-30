import Image from "next/image";
import { FunctionComponent } from "react";
import classNames from "classnames";
import { CustomClasses, Metric } from "../types";
import { PoolAssetInfo } from "../assets";
import { truncateString } from "../utils";

/** For displaying a token and it's balance, or a pool overview. */
export const AssetCard: FunctionComponent<
  {
    coinDenom: string;
    coinImageUrl?: string | PoolAssetInfo[];
    coinDenomCaption?: string;
    metrics: Metric[];
    isSuperfluid?: boolean;
    onClick?: () => void;
    showArrow?: boolean;
    contentClassName?: string;
  } & CustomClasses
> = ({
  coinDenom,
  coinImageUrl,
  coinDenomCaption,
  metrics,
  isSuperfluid = false,
  onClick,
  className,
  contentClassName,
}) => (
  <div
    className={classNames(
      "w-full rounded-2xl",
      {
        "p-[2px] bg-superfluid": isSuperfluid,
      },
      className
    )}
    onClick={() => onClick?.()}
  >
    <div
      className={classNames(
        "flex flex-col gap-3 place-content-between w-full bg-osmoverse-800 rounded-[0.875rem] p-9",
        contentClassName
      )}
    >
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            {coinImageUrl &&
              (Array.isArray(coinImageUrl) ? (
                coinImageUrl.map((url, index) => {
                  const src = typeof url === "string" ? url : url.coinImageUrl;

                  if (!src) return;

                  return (
                    <div key={index} className="h-[20px] w-[20px]">
                      <Image alt="asset" src={src} height={20} width={20} />
                    </div>
                  );
                })
              ) : (
                <div className="w-[2.125rem] h-[2.125rem] shrink-0 flex items-center justify-center overflow-hidden">
                  <Image
                    alt="asset"
                    src={coinImageUrl}
                    height={20}
                    width={20}
                  />
                </div>
              ))}
          </div>
          <h6>{truncateString(coinDenom, 12)}</h6>
        </div>
        {coinDenomCaption && (
          <span className="subtitle1 text-osmoverse-300">
            {coinDenomCaption}
          </span>
        )}
      </div>
      <div className="flex items-center place-content-between gap-2.5">
        {metrics.map(({ label, value }, index) => (
          <div key={index} className="flex flex-col text-left">
            <span className="subtitle1 text-osmoverse-400">{label}</span>
            <h6>{value}</h6>
          </div>
        ))}
      </div>
    </div>
  </div>
);
