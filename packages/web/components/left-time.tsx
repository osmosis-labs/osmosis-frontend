import React, { FunctionComponent } from "react";
import { MobileProps } from "./types";

export const LeftTime: FunctionComponent<
  {
    day?: string;
    hour: string;
    minute: string;
  } & MobileProps
> = ({ day, hour, minute, isMobile = false }) => {
  return (
    <div className="md:text-xl text-2xl flex items-center">
      {day && (
        <React.Fragment>
          <Time isMobile={isMobile}>{day}</Time>
          <div className="inline-block py-1 md:px-2 px-3 h-full rounded-lg bg-card mx-1">
            <TimeLabel isMobile={isMobile}>D</TimeLabel>
          </div>
        </React.Fragment>
      )}

      <Time isMobile={isMobile}>{hour}</Time>
      <div className="inline-block py-1 md:px-2 px-3 h-full rounded-lg bg-card mx-1">
        <TimeLabel isMobile={isMobile}>H</TimeLabel>
      </div>
      <Time isMobile={isMobile}>{minute}</Time>
      <div className="inline-block py-1 md:px-2 px-3 h-full rounded-lg bg-card mx-1">
        <TimeLabel isMobile={isMobile}>M</TimeLabel>
      </div>
    </div>
  );
};

const TimeLabel: FunctionComponent<MobileProps> = ({
  isMobile = false,
  children,
}) =>
  isMobile ? (
    <h6 className="md:text-lg text-xl">{children}</h6>
  ) : (
    <h5 className="md:text-lg text-xl">{children}</h5>
  );

const Time: FunctionComponent<MobileProps> = ({ isMobile = false, children }) =>
  isMobile ? (
    <h5 className="md:text-lg text-xl">{children}</h5>
  ) : (
    <h4 className="md:text-lg text-xl">{children}</h4>
  );
