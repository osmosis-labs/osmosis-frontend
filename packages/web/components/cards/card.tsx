import classNames from "classnames";
import React, { ReactNode } from "react";

export const Card: React.FC<{ children: ReactNode; classes?: string }> = ({
  children,
  classes = "",
}) => {
  return (
    <div
      className={classNames(
        `relative flex h-full flex-col rounded-[24px] bg-osmoverse-800 px-1 py-1`,
        classes
      )}
    >
      {children}
    </div>
  );
};
