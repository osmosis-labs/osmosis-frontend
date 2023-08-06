import React from "react";
import { useTranslation } from "react-multi-lang";

import OsmoverseCard from "~/components/cards/osmoverse-card";

export const ValidatorSquad = () => {
  const t = useTranslation();
  return (
    <>
      <div className="mx-2 flex justify-between">
        <span>{t("stake.validatorHeader")}</span>
        <span>{t("stake.edit")}</span>
      </div>
      <OsmoverseCard>
        <div className="flex flex-row space-x-2">
          <AvatarIcon />
          <AvatarIcon />
          <AvatarIcon />
          <AvatarIcon />
          <AvatarIcon />
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
