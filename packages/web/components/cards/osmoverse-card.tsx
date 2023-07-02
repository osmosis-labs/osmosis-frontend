import React, { ReactNode } from "react";

export const OsmoverseCard: React.FC<{ children: ReactNode }> = ({
  children,
}) => (
  <div className="flex flex-col gap-3">
    <div className="rounded-xl bg-osmoverse-900 px-4 py-[22px] transition-all ease-inBack md:rounded-xl md:px-3 md:py-2.5">
      {children}
    </div>
  </div>
);

export default OsmoverseCard;
