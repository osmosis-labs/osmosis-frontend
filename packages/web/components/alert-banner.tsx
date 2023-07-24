import React from "react";

import { Icon, SpriteIconId } from "~/components/assets";

export const AlertBanner: React.FC<{
  iconId?: SpriteIconId;
  title: string;
  subtitle: string;
}> = ({ iconId, title, subtitle }) => {
  return (
    <div className="z-50 mb-2 flex flex w-full items-center gap-5 rounded-[24px] bg-gradient-positive py-3 px-10">
      {iconId && <Icon id={iconId} width={80} height={80} />}
      <div className="flex w-full flex-col gap-1 py-2.5 pl-3">
        <h6 className="font-semibold">{title}</h6>
        <div className="flex gap-3">
          <p className="text-sm font-light">{subtitle}</p>
        </div>
      </div>
    </div>
  );
};
