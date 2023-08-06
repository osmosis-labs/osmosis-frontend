import classnames from "classnames";
import React, { ReactNode } from "react";

interface OsmoverseCardProps {
  children: ReactNode;
  bgColor?: string;
  containerClasses?: string;
}

export const OsmoverseCard: React.FC<OsmoverseCardProps> = ({
  children,
  bgColor = "bg-osmoverse-900",
  containerClasses = "",
}) => (
  <div className="flex flex-col gap-3">
    <div
      className={classnames(
        "rounded-xl px-4 py-[22px] transition-all ease-inBack md:rounded-xl md:px-3 md:py-2.5",
        bgColor,
        containerClasses
      )}
    >
      {children}
    </div>
  </div>
);

export default OsmoverseCard;
