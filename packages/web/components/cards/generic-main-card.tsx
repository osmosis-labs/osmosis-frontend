import React, { ReactNode } from "react";

import { IconLink } from "~/components/cards/icon-link";

export const GenericMainCard: React.FC<{
  children: ReactNode;
  title?: string;
  titleIcon?: ReactNode;
  titleIconAction?: string;
  width?: string;
}> = ({ children, title, titleIcon, titleIconAction, width = "27" }) => {
  return (
    <div
      className={`relative flex flex-col gap-8 overflow-hidden rounded-[24px] bg-osmoverse-800 px-1 py-1 lg:mx-auto md:mt-mobile-header md:gap-6 md:px-3 md:pt-4 md:pb-4`}
      style={{ width: `${width}rem` }}
    >
      <div className="relative flex flex-col gap-4 overflow-hidden rounded-[24px] bg-osmoverse-800 px-6 pt-8 pb-8 md:px-3 md:pt-4 md:pb-4">
        <div className="relative flex w-full items-center justify-between">
          <div className="grid w-full items-center justify-items-center">
            <h6 className="text-center">{title}</h6>
            {titleIcon && titleIconAction && (
              <div className="absolute right-0">
                <IconLink url={titleIconAction}>{titleIcon}</IconLink>
              </div>
            )}
          </div>
        </div>
        {children}
      </div>
    </div>
  );
};
