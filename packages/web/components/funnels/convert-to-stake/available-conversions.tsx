import {
  SuggestedConvertToStakeAssets,
  UserConvertToStakeConfig,
} from "@osmosis-labs/stores";
import classNames from "classnames";
import { observer } from "mobx-react-lite";
import Image from "next/image";
import { FunctionComponent } from "react";

import { PoolAssetsIcon, PoolAssetsName } from "~/components/assets";
import { CheckBox } from "~/components/control";
import { Disableable } from "~/components/types";
import { useTranslation } from "~/hooks";

/** List of options a user has for converting GAMM shares to staked OSMO. */
export const AvailableConversions: FunctionComponent<{
  convertToStakeConfig: UserConvertToStakeConfig;
}> = observer(({ convertToStakeConfig }) => {
  const { t } = useTranslation();

  return (
    <div className="m-2 flex flex-col gap-8">
      <div className="m-2 mx-auto flex w-2/3 flex-col gap-4">
        <p className="body2 text-osmoverse-200">
          {t("convertToStake.description")}
        </p>
        <div className="relative flex h-fit w-full place-content-evenly items-center justify-end gap-5 overflow-clip rounded-xl bg-bullish-300/20 p-3 text-center">
          <Image
            alt="osmo-tokens"
            src="/images/osmo-tokens.svg"
            width={100}
            height={130}
            className="absolute left-1 -top-10 h-[130px] rotate-45"
          />
          <span className="subtitle1 text-bullish-100">
            {t("convertToStake.stakedOsmo")}
          </span>
          <h6 className="mr-4 text-bullish-300">
            {`${convertToStakeConfig.stakeApr.maxDecimals(1)}% ` +
              t("convertToStake.APR")}
          </h6>
        </div>
      </div>
      <div className="flex h-60 flex-col gap-2 overflow-y-scroll">
        {convertToStakeConfig.suggestedConvertibleAssetsPerPool.map(
          (suggestedConversion) => (
            <ConversionRow
              key={suggestedConversion.poolId}
              {...suggestedConversion}
              isSelected={convertToStakeConfig.selectedConversionPoolIds.has(
                suggestedConversion.poolId
              )}
              disabled={
                !convertToStakeConfig.selectedConversionPoolIds.has(
                  suggestedConversion.poolId
                ) && !convertToStakeConfig.canSelectMorePools
              }
              onToggle={(isOn) => {
                if (isOn) {
                  convertToStakeConfig.selectConversionPoolId(
                    suggestedConversion.poolId
                  );
                } else {
                  convertToStakeConfig.deselectConversionPoolId(
                    suggestedConversion.poolId
                  );
                }
              }}
            />
          )
        )}
      </div>
    </div>
  );
});

export const ConversionRow: FunctionComponent<
  SuggestedConvertToStakeAssets &
    Disableable & {
      isSelected: boolean;
      onToggle: (isOn: boolean) => void;
    }
> = ({
  poolId,
  userPoolAssets,
  currentApr,
  isSelected,
  onToggle,
  disabled,
}) => {
  const { t } = useTranslation();

  return (
    <div
      className={classNames(
        "flex w-full cursor-pointer place-content-between items-center rounded-2xl bg-osmoverse-700 p-5 transition-colors hover:bg-osmoverse-600",
        {
          "cursor-not-allowed": disabled,
        }
      )}
      onClick={() => {
        onToggle(!isSelected);
      }}
    >
      <div className="flex items-center gap-5">
        <CheckBox
          className="transition-all after:!h-6 after:!w-6 after:!rounded-[10px] after:!border-2 after:!border-wosmongton-200 after:!bg-transparent checked:after:border-none checked:after:!bg-wosmongton-200"
          isOn={isSelected}
          disabled={disabled}
          onToggle={onToggle}
        />
        <div className="flex items-center gap-14">
          <div className="flex items-center gap-3">
            <PoolAssetsIcon
              size="sm"
              assets={userPoolAssets.map((asset) => asset.currency)}
            />
            <div className="flex flex-col">
              <PoolAssetsName
                size="sm"
                assetDenoms={userPoolAssets.map(
                  (asset) => asset.currency.coinDenom
                )}
              />
              <span className="body2 text-osmoverse-300">
                {t("convertToStake.pool", { poolId })}
              </span>
            </div>
          </div>
        </div>
      </div>
      <div className="flex flex-col text-right">
        <span className="subtitle1 text-osmoverse-100">
          {t("convertToStake.currentApr")}
        </span>
        <span className="body2 text-osmoverse-300">
          {currentApr.maxDecimals(1).toString()}
        </span>
      </div>
    </div>
  );
};
