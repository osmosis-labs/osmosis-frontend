import React, { ReactNode } from "react";

export const Card: React.FC<{ children: ReactNode; classNames?: string }> = ({
  children,
  classNames = "",
}) => {
  return (
    <div
      className={`relative flex h-full flex-col rounded-[24px] bg-osmoverse-800 px-1 py-1 ${
        classNames ? classNames : ""
      }`}
    >
      {children}
    </div>
  );
};
