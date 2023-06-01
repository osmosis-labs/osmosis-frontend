import React, { FC } from "react";

export const Pill: FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className,
}) => (
  <div
    className={`flex w-16 items-center justify-center rounded-full bg-gradient-positive px-1 uppercase text-black ${className}`}
  >
    {children}
  </div>
);
