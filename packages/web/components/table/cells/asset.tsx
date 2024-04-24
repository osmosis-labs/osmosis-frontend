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
  }>
> = ({ coinDenom, coinName, coinImageUrl, warnUnverified = false }) => {
  const { t } = useTranslation();

  return (
    <div className="min-w-44 flex w-full items-center gap-4 md:gap-1">
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
      <div className="flex min-w-0 flex-grow flex-col">
        {coinName && (
          <div className="flex items-center gap-2">
            <div className="subtitle1 min-w-40 overflow-hidden overflow-ellipsis whitespace-nowrap">
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
