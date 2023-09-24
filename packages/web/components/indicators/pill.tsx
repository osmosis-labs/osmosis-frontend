import classNames from "classnames";
import React, { FC } from "react";

export const Pill: FC<{
  children: React.ReactNode;
  className?: string;
  animate?: boolean;
}> = ({ children, className, animate }) => (
  <div
    className={classNames(
      "flex w-16 items-center justify-center rounded-full bg-gradient-positive px-1 uppercase text-black",
      animate && "animate-[scaleFadeIn_0.3s] ease-in-out",
      className
    )}
  >
    {children}
  </div>
);
