import classNames from "classnames";
import { observer } from "mobx-react-lite";
import Image from "next/image";
import React, { FunctionComponent, useState } from "react";

import { Icon } from "~/components/assets";
import { AssetCell as Cell } from "~/components/table/cells/types";
import { Tooltip } from "~/components/tooltip";
import { useTranslation } from "~/hooks";
import { useStore } from "~/stores";
import { UnverifiedAssetsState } from "~/stores/user-settings";

export const AssetNameCell: FunctionComponent<Partial<Cell>> = observer(
  ({
    coinDenom,
    assetName,
    coinImageUrl,
    isFavorite,
    isVerified,
    onToggleFavorite,
  }) => {
    const { userSettings } = useStore();
    const [showStar, setShowStar] = useState(false);
    const { t } = useTranslation();

    const shouldDisplayUnverifiedAssets =
      userSettings.getUserSettingById<UnverifiedAssetsState>(
        "unverified-assets"
      )?.state.showUnverifiedAssets;

    return (
      <div
        className={classNames("flex items-center gap-2", {
          "opacity-40": !shouldDisplayUnverifiedAssets && !isVerified,
        })}
        onMouseEnter={() => setShowStar(true)}
        onMouseLeave={() => setShowStar(false)}
      >
        {showStar || isFavorite ? (
          <div className="cursor-pointer">
            <Image
              alt="star"
              onClick={(event) => {
                event.preventDefault();
                event.stopPropagation();

                if (onToggleFavorite) {
                  onToggleFavorite();
                }
              }}
              src={`/icons/star${isFavorite ? "-filled" : ""}.svg`}
              height={24}
              width={24}
            />
          </div>
        ) : (
          <div style={{ height: 24, width: 24 }} />
        )}
        {coinDenom ? (
          <div className="flex items-center gap-4">
            <div>
              {coinImageUrl && (
                <Image
                  alt={coinDenom}
                  src={coinImageUrl}
                  height={40}
                  width={40}
                />
              )}
            </div>
            <div className="flex flex-col place-content-center">
              <div className="flex">
                <span className="subtitle1 text-white-high">{coinDenom}</span>
              </div>
              {assetName && (
                <span className="body2 self-start text-osmoverse-400">
                  {assetName}
                </span>
              )}
            </div>
            {shouldDisplayUnverifiedAssets && !isVerified && (
              <Tooltip content={t("components.selectToken.unverifiedAsset")}>
                <Icon
                  id="alert-triangle"
                  className="h-5 w-5 text-osmoverse-300"
                />
              </Tooltip>
            )}
          </div>
        ) : (
          <span>{coinDenom}</span>
        )}
      </div>
    );
  }
);
