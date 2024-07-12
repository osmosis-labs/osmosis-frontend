import { isNil } from "@osmosis-labs/utils";
import classNames from "classnames";
import { FunctionComponent } from "react";

import { CustomClasses } from "../types";

export type Step = { displayLabel?: string; onClick?: () => void };

export const StepProgress: FunctionComponent<
  {
    steps: Step[];
    /** 0-indexed */
    currentStep: number;
  } & CustomClasses
> = ({ steps, currentStep, className }) => {
  const percentage = (currentStep / (steps.length - 1)) * 100;

  const showLabels = steps.some(({ displayLabel }) => Boolean(displayLabel));

  return (
    <div
      className={classNames(
        "relative mb-4 h-[0.063rem] w-full rounded-full bg-osmoverse-800",
        className
      )}
    >
      <div
        className="ease relative h-[0.063rem] rounded-full bg-ammelia-300 transition-width"
        style={{ width: percentage + "%" }}
      >
        <div className="absolute inset-y-0 -right-1 m-auto h-2 w-2 rounded-full bg-ammelia-300" />
      </div>
      {showLabels &&
        steps.map(({ displayLabel, onClick }, index) => {
          const stepPercentage = (index / (steps.length - 1)) * 100;
          const selected = index === currentStep;

          const isClickable = !isNil(onClick);

          return (
            <div
              key={displayLabel}
              role={isClickable ? "button" : undefined}
              className={classNames(
                "body2 transition-color absolute top-2 -translate-x-1/2 duration-150",
                {
                  "text-white-full": selected,
                  "text-osmoverse-300": !selected,
                  "cursor-pointer": isClickable,
                  "cursor-default": !isClickable,
                }
              )}
              style={{
                left: stepPercentage + "%",
              }}
              onClick={onClick}
            >
              {displayLabel}
            </div>
          );
        })}
    </div>
  );
};
