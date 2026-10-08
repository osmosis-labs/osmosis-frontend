import classNames from "classnames";
import type { LottieHandle } from "lottie-react";
import React, {
  PropsWithChildren,
  ReactElement,
  useEffect,
  useRef,
  useState,
} from "react";

import { DynamicLottieAnimation } from "~/components/animation";
import { Tooltip } from "~/components/tooltip";
import { Button } from "~/components/ui/button";

const ConditionalTooltip = ({
  children,
  disabled,
  disabledTooltipContent,
}: PropsWithChildren<{
  disabled: boolean;
  disabledTooltipContent?: string;
}>) =>
  disabled ? (
    <Tooltip content={disabledTooltipContent} className="h-full w-full">
      {children as ReactElement}
    </Tooltip>
  ) : (
    <>{children}</>
  );

export const RewardsCard: React.FC<{
  title: string;
  disabledTooltipContent?: string;
  onClick: () => void;
  disabled: boolean;
  globalLottieFileKey: string;
  position: "left" | "right";
}> = ({
  title,
  disabledTooltipContent,
  onClick,
  disabled,
  globalLottieFileKey,
  position,
}) => {
  const positionClasses =
    position === "right"
      ? `[mask-image:url('/images/folder-right-tab.svg')] bg-[url('/images/grid-right-tab.svg')]`
      : `[mask-image:url('/images/folder-left-tab.svg')] bg-[url('/images/grid-left-tab.svg')]`;

  const [hover, setHover] = useState(false);
  const lottieRef = useRef<LottieHandle>(null);

  // lottie-react v3 reads `autoplay` only at load, so drive hover playback
  // through the handle once the animation exists.
  useEffect(() => {
    if (hover) lottieRef.current?.play();
    else lottieRef.current?.pause();
  }, [hover]);

  return (
    <Button
      disabled={disabled}
      variant="ghost"
      className="relative !h-[150px] !max-h-[150px] !w-[300px] !max-w-[300px] !p-0 disabled:opacity-50"
      onClick={onClick}
    >
      <ConditionalTooltip
        disabled={disabled}
        disabledTooltipContent={disabledTooltipContent}
      >
        <div
          className={classNames(
            "relative h-full w-full bg-cover [mask-repeat:no-repeat] [mask-size:contain]",
            positionClasses
          )}
        ></div>
        <DynamicLottieAnimation
          onMouseEnter={() => setHover(true)}
          onMouseLeave={() => setHover(false)}
          className={classNames(
            "absolute left-0 top-0 z-20",
            position === "right" ? "scale-[0.85]" : "scale-1"
          )}
          globalLottieFileKey={globalLottieFileKey}
          importFn={() => import(`./${globalLottieFileKey}.json`)}
          loop={true}
          lottieRef={lottieRef}
          // Starts playing if the hover began while the animation was loading.
          autoplay={hover}
        />
        <div
          className={classNames(
            `${position}-0`,
            "absolute top-0 flex items-center gap-2 px-2 py-3"
          )}
        >
          <span className="text-osmoverse-white z-30 text-sm">{title}</span>
        </div>
      </ConditionalTooltip>
    </Button>
  );
};
