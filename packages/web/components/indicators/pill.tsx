import classNames from "classnames";
import React, { FC } from "react";

export const Pill: FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className }) => (
  <div
    className={classNames(
      "flex w-fit items-center justify-center rounded-full bg-gradient-positive px-1 font-semibold uppercase text-black",
      className
    )}
  >
    {children}
  </div>
);
