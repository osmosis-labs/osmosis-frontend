import classNames from "classnames";
import React, { ReactNode } from "react";

import { Button } from "~/components/ui/button";

import { CustomClasses } from "../types";

export const GenericMainCard: React.FC<
  {
    children: ReactNode;
    title?: string;
    titleIcon?: ReactNode;
    titleIconAction?: () => void;
    className?: string;
  } & CustomClasses
> = ({ children, title, titleIcon, titleIconAction, className }) => {
  return (
    <div
      className={classNames(
        "flex flex-grow flex-col gap-4 overflow-hidden rounded-3xl bg-osmoverse-850 px-6 py-8 lg:px-3 lg:pt-4 lg:pb-4",
        className
      )}
    >
      <div className="relative flex w-full items-center justify-between">
        <div className="grid w-full items-center justify-items-center">
          {Boolean(title) && <h6 className="text-center">{title}</h6>}
          {titleIcon && titleIconAction && (
            <div className="absolute right-0">
              <Button
                variant="ghost"
                onClick={titleIconAction}
                className="px-0"
              >
                {titleIcon}
              </Button>
            </div>
          )}
        </div>
      </div>
      {children}
    </div>
  );
};
