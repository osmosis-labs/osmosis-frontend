import { AssetVariant } from "@osmosis-labs/server/src/queries/complex/portfolio/allocation";
import classNames from "classnames";
import React from "react";

import { FallbackImg, Icon } from "~/components/assets";
import { Tooltip } from "~/components/tooltip";
import { Checkbox } from "~/components/ui/checkbox";
import { useTranslation } from "~/hooks";

interface AssetVariantRowProps {
  variant: AssetVariant;
  isChecked: boolean;
  isConverting: boolean;
  onCheck: () => void;
}

export const AssetVariantRow: React.FC<AssetVariantRowProps> = ({
  variant,
  isChecked,
  isConverting,
  onCheck,
}) => {
  const { t } = useTranslation();

  return (
    <div
      className={classNames(
        "-mx-4 flex items-center justify-between gap-3 rounded-2xl p-4",
        {
          "cursor-pointer hover:bg-osmoverse-alpha-850": !isConverting,
        }
      )}
      onClick={() => !isConverting && onCheck()}
    >
      <Checkbox checked={isChecked} className="mr-2" disabled={isConverting} />
      <div className="flex w-[262px] min-w-[262px] max-w-[262px] items-center gap-3 py-2 px-4">
        <FallbackImg
          src={variant?.asset?.coinImageUrl ?? ""}
          alt={variant?.asset?.coinDenom ?? ""}
          fallbacksrc="/icons/question-mark.svg"
          height={40}
          width={40}
        />
        <div className="flex flex-col gap-1 overflow-hidden">
          <span className="subtitle1 truncate">{variant.asset?.coinName}</span>
          <span className="body2 truncate text-osmoverse-300">
            {variant?.asset?.coinDenom ?? ""}
          </span>
        </div>
      </div>
      <div className="flex items-center justify-center">
        <Icon
          id="arrow"
          height={24}
          width={24}
          className="text-osmoverse-300"
        />
      </div>
      <div className="flex w-[262px] items-center gap-3 py-2 px-4">
        <FallbackImg
          src={variant?.canonicalAsset?.coinImageUrl ?? ""}
          alt={variant?.canonicalAsset?.coinDenom ?? ""}
          fallbacksrc="/icons/question-mark.svg"
          height={40}
          width={40}
        />
        <div className="flex flex-col gap-1 overflow-hidden">
          <span className="subtitle1 truncate">
            {variant.canonicalAsset?.coinName}
          </span>
          <span className="body2 truncate text-osmoverse-300">
            {variant?.canonicalAsset?.coinDenom ?? ""}
          </span>
        </div>
      </div>
      {variant.canonicalAsset?.isAlloyed && (
        <div className="flex items-center justify-center">
          <Tooltip
            arrow={true}
            content={
              <div className="flex gap-3">
                <div>
                  <Icon
                    id="alloyed"
                    height={16}
                    width={16}
                    className="text-ammelia-400"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <span className="caption">
                    {t("assetVariantsConversion.tooltipTitle", {
                      coinName: variant.canonicalAsset?.coinName ?? "",
                    })}
                  </span>
                  <span className="caption text-osmoverse-300">
                    {t("assetVariantsConversion.tooltipDescription", {
                      coinDenom: variant.canonicalAsset?.coinDenom ?? "",
                    })}
                  </span>
                </div>
              </div>
            }
          >
            <Icon
              id="alloyed"
              height={24}
              width={24}
              className="text-osmoverse-alpha-700"
            />
          </Tooltip>
        </div>
      )}
    </div>
  );
};
