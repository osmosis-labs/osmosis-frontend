import classNames from "classnames";
import { FunctionComponent } from "react";

import { DynamicLottieAnimation } from "~/components/animation";
import { CustomClasses } from "~/components/types";
import { Button } from "~/components/ui/button";

interface Props extends CustomClasses {
  title: string;
  caption?: string;
  primaryCta: string;
  secondaryCta: string;
  onCtaClick: () => void;
  onSecondaryClick: () => void;
}

/**
 * On mobile the text wrappers become `contents`, so the title, animation,
 * caption and buttons stack as one column with the animation under the title.
 */
export const SuperchargePool: FunctionComponent<Props> = (props) => (
  <div
    className={classNames(
      "flex w-full place-content-between gap-10 rounded-3xl p-7 md:flex-col md:gap-4",
      props.className
    )}
  >
    <div className="flex flex-1 flex-col place-content-between gap-4 md:contents">
      <div className="flex flex-col gap-4 md:contents">
        <h6 className="md:order-1">{props.title}</h6>
        <Caption {...props} />
      </div>
      <Buttons {...props} />
    </div>
    <DynamicLottieAnimation
      // The animation canvas has empty space below the chart; crop it on mobile.
      className="w-[496px] md:order-2 md:-mb-10 md:w-full"
      globalLottieFileKey="step1"
      importFn={() => import("./step1.json")}
      loop={true}
    />
  </div>
);

const Buttons: FunctionComponent<Props> = ({
  primaryCta,
  secondaryCta,
  onSecondaryClick,
  onCtaClick,
}) => (
  <div className="flex shrink-0 gap-4 md:order-4 md:w-full md:flex-col">
    <Button
      variant="outline"
      className="w-fit shrink-0 md:w-full"
      onClick={onSecondaryClick}
    >
      {secondaryCta}
    </Button>
    <Button
      className="w-fit shrink-0 border-0 bg-gradient-supercharged text-osmoverse-1000 md:w-full"
      onClick={onCtaClick}
    >
      {primaryCta}
    </Button>
  </div>
);

const Caption: FunctionComponent<{ caption?: string }> = ({ caption }) =>
  caption ? (
    <span className="body2 text-osmoverse-100 md:order-3">{caption}</span>
  ) : null;
