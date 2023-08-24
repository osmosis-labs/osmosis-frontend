import React, { ReactNode } from "react";

import { Card } from "~/components/cards";
import { IconLink } from "~/components/cards/icon-link";

export const GenericMainCard: React.FC<{
  children: ReactNode;
  title?: string;
  titleIcon?: ReactNode;
  titleIconAction?: string;
}> = ({ children, title, titleIcon, titleIconAction }) => {
  return (
    <Card>
      <div className="flex flex-grow flex-col gap-4 overflow-hidden rounded-[24px] bg-osmoverse-800 px-6 pt-8 pb-8 lg:px-3 lg:pt-4 lg:pb-4">
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
    </Card>
  );
};
