import classNames from "classnames";
import Image from "next/image";
import { FunctionComponent } from "react";

import { Button } from "~/components/buttons";
import { CustomClasses } from "~/components/types";
import { useWindowSize } from "~/hooks";

export const SuperchargeDaiOsmoPool: FunctionComponent<
  {
    title: string;
    caption?: string;
    primaryCta: string;
    secondaryCta: string;
    onCtaClick: () => void;
    onSecondaryClick: () => void;
  } & CustomClasses
> = ({
  className,
  title,
  caption,
  primaryCta,
  secondaryCta,
  onCtaClick,
  onSecondaryClick,
}) => {
  const { isMobile } = useWindowSize();

  const Buttons = () => (
    <div className="flex shrink-0 gap-4 md:w-full md:flex-col">
      <Button
        className="w-fit shrink-0 md:w-full"
        mode="secondary"
        onClick={onSecondaryClick}
        size={isMobile ? "sm" : "normal"}
      >
        {secondaryCta}
      </Button>
      <Button
        className="w-fit shrink-0 border-0 bg-gradient-supercharged text-osmoverse-1000 md:w-full"
        onClick={onCtaClick}
        size={isMobile ? "sm" : "normal"}
      >
        {primaryCta}
      </Button>
    </div>
  );

  const Caption = () =>
    caption ? (
      <span className="body2 text-osmoverse-100">{caption}</span>
    ) : null;

  return (
    <div
      className={classNames(
        "flex w-full flex-col gap-6 rounded-3xl bg-osmoverse-800 px-7 pt-8 md:pb-8",
        className
      )}
    >
      <div className="flex place-content-between gap-4 lg:flex-col">
        <div className="flex flex-col gap-3">
          <h6>{title}</h6>
          {!isMobile && <Caption />}
        </div>
        {!isMobile && <Buttons />}
      </div>
      <div className="flex-end mx-auto flex flex-col">
        <Image
          alt="number-lab"
          src="/images/number-lab.svg"
          height={isMobile ? 322 : 270}
          width={855}
        />
      </div>
      {isMobile && (
        <>
          <Caption />
          <Buttons />
        </>
      )}
    </div>
  );
};
