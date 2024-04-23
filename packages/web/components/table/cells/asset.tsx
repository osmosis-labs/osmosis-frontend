import Image from "next/image";
import { FunctionComponent } from "react";

import { Icon } from "~/components/assets";
import { Tooltip } from "~/components/tooltip";
import { useTranslation } from "~/hooks";

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
    <div className="flex w-44 items-center gap-4 md:gap-1">
      <div className="h-10 w-10 shrink-0">
        {coinImageUrl && (
          <Image
            alt={coinDenom ?? "coin image"}
            src={coinImageUrl}
            height={40}
            width={40}
          />
        )}
      </div>
      <div className="flex w-full flex-col place-content-center">
        {coinName && (
          <div className="subtitle1 overflow-hidden overflow-ellipsis whitespace-nowrap">
            {coinName}
          </div>
        )}
        {coinDenom && (
          <span className="body2 md:caption overflow-hidden overflow-ellipsis whitespace-nowrap text-osmoverse-400 md:w-28">
            {coinDenom}
          </span>
        )}
      </div>
      {warnUnverified && (
        <Tooltip content={t("components.selectToken.unverifiedAsset")}>
          <Icon id="alert-triangle" className="h-5 w-5 text-osmoverse-300" />
        </Tooltip>
      )}
    </div>
  );
};
