import React from "react";
import { useTranslation } from "react-multi-lang";

import { Button } from "~/components/buttons";
import OsmoverseCard from "~/components/cards/osmoverse-card";

export const ValidatorSquadCard: React.FC<{
  setShowValidatorModal: (val: boolean) => void;
}> = ({ setShowValidatorModal }) => {
  const t = useTranslation();
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
        <div className="flex-column flex justify-between ">
          <div className="flex flex-row space-x-2">
            <AvatarIcon />
            <AvatarIcon />
            <AvatarIcon />
            <AvatarIcon />
            <AvatarIcon />
          </div>
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
};

function AvatarIcon() {
  return (
    <div className="relative flex h-16 w-16 items-center justify-center overflow-hidden rounded-lg bg-[#282750]">
      <div className="absolute top-3 h-6 w-6 rounded-full bg-[#7469A6]"></div>
      <div className="absolute -bottom-5 h-10 w-10 rounded-full bg-[#7469A6]"></div>
    </div>
  );
}

export default AvatarIcon;