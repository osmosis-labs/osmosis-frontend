import classNames from "classnames";
import { FunctionComponent } from "react";

import { DynamicLottieAnimation } from "~/components/animation";
import { Button } from "~/components/buttons";
import { CustomClasses } from "~/components/types";

interface Props extends CustomClasses {
  title: string;
  caption?: string;
  primaryCta: string;
  secondaryCta: string;
  onCtaClick: () => void;
  onSecondaryClick: () => void;
}

export const SuperchargePool: FunctionComponent<Props> = (props) => (
  <div
    className={classNames(
      "flex w-full place-content-between gap-10 rounded-3xl bg-osmoverse-800 p-7",
      props.className
    )}
  >
    <div className="flex flex-1 flex-col place-content-between gap-4">
      <div className="flex flex-col gap-4">
        <h6>{props.title}</h6>
        <Caption {...props} />
      </div>
      <Buttons {...props} />
    </div>
    <DynamicLottieAnimation
      className="w-[496px]"
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
  <div className="flex shrink-0 gap-4 md:w-full md:flex-col">
    <Button
      className="w-fit shrink-0 md:w-full"
      mode="secondary"
      onClick={onSecondaryClick}
      size="normal"
    >
      {secondaryCta}
    </Button>
    <Button
      className="w-fit shrink-0 border-0 bg-gradient-supercharged text-osmoverse-1000 md:w-full"
      onClick={onCtaClick}
      size="normal"
    >
      {primaryCta}
    </Button>
  </div>
);

const Caption: FunctionComponent<{ caption?: string }> = ({ caption }) =>
  caption ? <span className="body2 text-osmoverse-100">{caption}</span> : null;
