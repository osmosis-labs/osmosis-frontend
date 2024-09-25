import classNames from "classnames";
import Image from "next/image";
import { FunctionComponent } from "react";

import { Icon } from "~/components/assets";
import { Tooltip } from "~/components/tooltip";
import { useTranslation } from "~/hooks";

/** Width should be defined by parent elements. */
export const AssetCell: FunctionComponent<
  Partial<{
    coinDenom: string;
    coinName: string;
    coinImageUrl: string;
    warnUnverified: boolean;
    isInUserWatchlist: boolean;
    onClickWatchlist: () => void;
  }>
> = ({
  coinDenom,
  coinName,
  coinImageUrl,
  warnUnverified = false,
  isInUserWatchlist,
  onClickWatchlist,
}) => {
  const { t } = useTranslation();

  return (
    <div className="w-container flex items-center gap-4 overflow-hidden md:gap-3">
      {isInUserWatchlist !== undefined && onClickWatchlist && (
        <div className="min-w-6 min-h-6">
          <Icon
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              onClickWatchlist();
            }}
            className={classNames(
              "cursor-pointer transition-colors duration-150 ease-out hover:text-wosmongton-300",
              isInUserWatchlist ? "text-wosmongton-400" : "text-osmoverse-600"
            )}
            id={isInUserWatchlist ? "star" : "star-outlined"}
          />
        </div>
      )}
      <div className="h-10 w-10 flex-shrink-0">
        {coinImageUrl && (
          <Image
            alt={coinDenom ?? "coin image"}
            src={coinImageUrl}
            height={40}
            width={40}
          />
        )}
      </div>
      <div className="flex flex-grow flex-col overflow-hidden">
        {coinName && (
          <div className="flex items-center gap-2 overflow-hidden">
            <div className="subtitle1 overflow-hidden overflow-ellipsis whitespace-nowrap">
              {coinName}
            </div>
            {warnUnverified && (
              <Tooltip content={t("components.selectToken.unverifiedAsset")}>
                <Icon
                  id="alert-triangle"
                  className="h-5 w-5 text-osmoverse-300"
                />
              </Tooltip>
            )}
          </div>
        )}
        {coinDenom && (
          <span className="body2 md:caption overflow-hidden overflow-ellipsis whitespace-nowrap text-osmoverse-400 md:w-28">
            {coinDenom}
          </span>
        )}
      </div>
    </div>
  );
};
