import classNames from "classnames";
import React from "react";

export const StakeTab: React.FC<{
  active?: boolean;
  onClick: () => void;
  children?: any;
}> = ({ active, onClick, children }) => {
  const baseClasses =
    "font-semibold leading-6 flex items-center px-1 cursor-pointer transition-colors duration-200 text-sm";
  const activeClasses =
    "text-bullish-400 border-b-4 border-bullish-400 rounded-sm";
  const inactiveClasses = "text-osmoverse-400";

  return (
    <div
      onClick={onClick}
      className={classNames(baseClasses, {
        [activeClasses]: active,
        [inactiveClasses]: !active,
      })}
    >
      {children}
    </div>
  );
};
