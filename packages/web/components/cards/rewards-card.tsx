import React from "react";

import { DynamicLottieAnimation } from "~/components/animation";
import { Icon } from "~/components/assets";
import { Button } from "~/components/buttons";
import { Tooltip } from "~/components/tooltip";

export const RewardsCard: React.FC<{
  title: string;
  tooltipContent: string;
  disabledTooltipContent?: string;
  onClick: () => void;
  // image?: JSX.Element;
  disabled: boolean;
  globalLottieFileKey: string;
}> = ({
  title,
  tooltipContent,
  disabledTooltipContent,
  onClick,
  // image = null,
  // disabled,
  globalLottieFileKey,
}) => {
  const disabled = false;
  const ConditionalWrapper: React.FC<{ children: React.ReactNode }> = ({
    children,
  }) =>
    disabled ? (
      <Tooltip content={disabledTooltipContent} className="w-full">
        {children as any}
      </Tooltip>
    ) : (
      <>{children}</>
    );

  console.log("globalLottieFileKey: ", globalLottieFileKey);

  return (
    <ConditionalWrapper>
      <Button
        disabled={disabled}
        mode="unstyled"
        className="relative flex min-h-[50px] w-full flex-grow cursor-pointer flex-col !items-end justify-start overflow-hidden rounded-[28px] border-[1px] border-osmoverse-600 bg-osmoverse-800 !p-0 disabled:cursor-not-allowed disabled:opacity-50"
        onClick={onClick}
      >
        <div
          className="mask1"
          style={{
            WebkitMaskImage: "./folder-mask.png",
            maskImage: "./folder-mask.png",
            WebkitMaskRepeat: "no-repeat",
            maskRepeat: "no-repeat",
          }}
        >
          <DynamicLottieAnimation
            className="h-full w-full"
            globalLottieFileKey={globalLottieFileKey}
            importFn={() => import(`./${globalLottieFileKey}.json`)}
            loop={true}
          />
        </div>
        <div className="absolute z-10 flex items-center gap-2 p-4">
          <span className="text-osmoverse-white z-50 text-sm">{title}</span>
          {!disabled && (
            <div className="text-osmoverse-600 sm:hidden">
              <Tooltip content={tooltipContent}>
                <Icon id="info" height="14px" width="14px" fill="#958FC0" />
              </Tooltip>
            </div>
          )}
        </div>
      </Button>
    </ConditionalWrapper>
  );
};
