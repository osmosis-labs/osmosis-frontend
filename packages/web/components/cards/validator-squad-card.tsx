import { CoinPretty, Dec } from "@keplr-wallet/unit";
import { Staking } from "@osmosis-labs/keplr-stores";
import { BondStatus } from "@osmosis-labs/types";
import { observer } from "mobx-react-lite";
import React from "react";
import { useCallback, useMemo } from "react";

import { FallbackImg } from "~/components/assets";
import OsmoverseCard from "~/components/cards/osmoverse-card";
import { Tooltip } from "~/components/tooltip";
import { Button } from "~/components/ui/button";
import { Breakpoint, useTranslation, useWindowSize } from "~/hooks";
import { useStore } from "~/stores";

export const ValidatorSquadCard: React.FC<{
  hasInsufficientBalance: boolean;
  setShowValidatorModal: (val: boolean) => void;
  validators?: Staking.Validator[];
  usersValidatorsMap: Map<string, Staking.Delegation>;
}> = observer(
  ({
    hasInsufficientBalance,
    setShowValidatorModal,
    validators,
    usersValidatorsMap,
  }) => {
    const { t } = useTranslation();
    const { chainStore, queriesStore } = useStore();
    const { chainId } = chainStore.osmosis;
    const queries = queriesStore.get(chainId);

    const { width } = useWindowSize();

    const maxVisibleValidators = width > Breakpoint.xl ? 8 : 3;

    const queryValidators = queries.cosmos.queryValidators.getQueryStatus(
      BondStatus.Bonded
    );

    const totalStakePool = queries.cosmos.queryPool.bondedTokens;

    let validatorBlock = (
      <div className="flex flex-row space-x-2">
        {Array(maxVisibleValidators)
          .fill(0)
          .map((_, index) => (
            <AvatarIcon key={index} />
          ))}
      </div>
    );

    const myValidators = useMemo(() => {
      return validators?.filter(({ operator_address }) =>
        usersValidatorsMap?.has(operator_address)
      );
    }, [usersValidatorsMap, validators]);

    const getFormattedMyStake = useCallback(
      (validator: Staking.Validator) => {
        const myStakeDec = new Dec(
          usersValidatorsMap.has(validator.operator_address)
            ? usersValidatorsMap.get(validator.operator_address)?.balance
                ?.amount || 0
            : 0
        );

        const myStakeCoinPretty = new CoinPretty(
          totalStakePool.currency,
          myStakeDec
        )
          .maxDecimals(2)
          .hideDenom(true)
          .toString();

        return myStakeCoinPretty;
      },
      [usersValidatorsMap, totalStakePool.currency]
    );

    if (validators?.length && myValidators?.length) {
      validatorBlock = (
        <div className="flex flex-row space-x-2">
          {myValidators?.slice(0, maxVisibleValidators).map((validator) => {
            const imageUrl = queryValidators.getValidatorThumbnail(
              validator.operator_address
            );
            const myStake = getFormattedMyStake(validator);

            const stakedOsmoDescription = `${myStake.toString()} ${t(
              "stake.dashboardStakedOsmo"
            )}`;

            const validatorName = validator?.description?.moniker;

            return (
              <div
                className="h-10 w-10 overflow-hidden rounded-full"
                key={validatorName}
              >
                <Tooltip
                  content={
                    <div className="flex flex-col gap-1 p-1">
                      <span className="text-osmoverse-white-100">
                        {validatorName}
                      </span>
                      <span className="text-xs text-osmoverse-200">
                        {stakedOsmoDescription}
                      </span>
                    </div>
                  }
                >
                  <FallbackImg
                    alt={validatorName}
                    src={imageUrl}
                    fallbacksrc="/icons/superfluid-osmo.svg"
                    height={40}
                    width={40}
                  />
                </Tooltip>
              </div>
            );
          })}

          {myValidators?.length > maxVisibleValidators && (
            <AvatarIcon
              extraValidators={myValidators?.length - maxVisibleValidators}
            />
          )}
        </div>
      );
    }

    return (
      <>
        <div className="flex items-center">
          <span className="caption text-sm text-osmoverse-200 md:text-xs">
            {t("stake.validatorHeader")}
          </span>
        </div>
        <OsmoverseCard containerClasses="!rounded-3xl">
          <div className="flex items-center justify-between space-x-2">
            {validatorBlock}
            <div className="flex items-center">
              <Button
                variant="outline"
                disabled={hasInsufficientBalance}
                onClick={() => setShowValidatorModal(true)}
              >
                {t("stake.viewOrEdit")}
              </Button>
            </div>
          </div>
        </OsmoverseCard>
      </>
    );
  }
);

const AvatarIcon: React.FC<{ extraValidators?: number }> = ({
  extraValidators,
}) => {
  return (
    <div className="relative flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-[#282750]">
      <div className="absolute top-3 h-4 w-4 rounded-full bg-[#7469A6] opacity-50"></div>
      <div className="absolute -bottom-5 h-7 w-7 rounded-full bg-[#7469A6] opacity-50"></div>
      {extraValidators && (
        <div className="text-white absolute inset-0 flex items-center justify-center">
          +{extraValidators}
        </div>
      )}
    </div>
  );
};

export default AvatarIcon;
