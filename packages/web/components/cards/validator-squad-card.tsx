import { Staking } from "@keplr-wallet/stores";
import { observer } from "mobx-react-lite";
import React from "react";
import { useTranslation } from "react-multi-lang";

import { Button } from "~/components/buttons";
import OsmoverseCard from "~/components/cards/osmoverse-card";
import { useStore } from "~/stores";

const maxVisibleValidators = 8;

export const ValidatorSquadCard: React.FC<{
  setShowValidatorModal: (val: boolean) => void;
  validators?: Staking.Validator[];
  usersValidatorsMap?: Map<string, Staking.Delegation>;
}> = observer(({ setShowValidatorModal, validators, usersValidatorsMap }) => {
  const t = useTranslation();
  const { chainStore, queriesStore } = useStore();
  const { chainId } = chainStore.osmosis;
  const queries = queriesStore.get(chainId);

  const queryValidators = queries.cosmos.queryValidators.getQueryStatus(
    Staking.BondStatus.Bonded
  );

  let validatorBlock = (
    <div className="flex flex-row space-x-2">
      {Array(maxVisibleValidators)
        .fill(0)
        .map((_, index) => (
          <AvatarIcon key={index} />
        ))}
    </div>
  );

  const myValidators = validators?.filter((validator) => {
    return usersValidatorsMap?.has(validator.operator_address);
  });

  if (validators?.length && myValidators?.length) {
    validatorBlock = (
      <div className="flex flex-row space-x-2">
        {myValidators?.slice(0, maxVisibleValidators).map((validator) => {
          const imageUrl = queryValidators.getValidatorThumbnail(
            validator.operator_address
          );

          return (
            <div
              className="h-10 w-10 overflow-hidden rounded-full"
              key={validator?.description?.moniker}
            >
              <img alt={validator?.description?.moniker} src={imageUrl || ""} />
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
      <div className="mx-2 flex items-center">
        <span className="caption text-sm text-osmoverse-200 md:text-xs">
          {t("stake.validatorHeader")}
        </span>
        <div className="pl-5">
          <Button
            size="xs"
            mode="bullish-special"
            onClick={() => {
              setShowValidatorModal(true);
            }}
          >
            {t("stake.edit")}
          </Button>
        </div>
      </div>
      <OsmoverseCard>
        <div className="flex-column flex items-center justify-between">
          {validatorBlock}
          <div className="flex items-center">
            <Button
              mode="bullish-special"
              size="normal"
              onClick={() => {
                setShowValidatorModal(true);
              }}
            >
              {t("stake.viewAll")}
            </Button>
          </div>
        </div>
      </OsmoverseCard>
    </>
  );
});

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
