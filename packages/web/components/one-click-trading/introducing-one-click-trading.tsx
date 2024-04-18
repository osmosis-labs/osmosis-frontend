import Image from "next/image";

import { Pill } from "~/components/indicators/pill";
import { Button, buttonVariants } from "~/components/ui/button";
import { useTranslation } from "~/hooks";

interface IntroducingOneClickProps {
  onStartTrading: () => void;
  onClickEditParams?: () => void;
  isLoading?: boolean;
  isDisabled?: boolean;
}

export const IntroducingOneClick = ({
  onClickEditParams,
  onStartTrading,
  isLoading,
  isDisabled,
}: IntroducingOneClickProps) => {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col items-center gap-8 text-center">
      <Pill className="!px-3 py-1 normal-case">
        {t("oneClickTrading.introduction.newFeature")}
      </Pill>
      <h1 className="text-h5 font-h5">
        {t("oneClickTrading.introduction.introducingTitle")}
      </h1>
      <h2 className="px-8 text-body2 font-body2 text-osmoverse-200">
        {t("oneClickTrading.introduction.introducingSubtitle")}{" "}
        <a
          className={buttonVariants({
            variant: "link",
            size: "sm",
            className:
              "!inline w-auto !px-0 !text-body2 !font-body2 text-wosmongton-300",
          })}
          // TODO: Add link
        >
          {t("oneClickTrading.introduction.learnMore")} ↗️
        </a>
      </h2>
      <Image
        width={480}
        height={224}
        src="/images/1ct-intro-graphics.svg"
        alt="1ct intro"
      />
      <Button
        className="w-fit px-10"
        onClick={onStartTrading}
        isLoading={isLoading}
        disabled={isDisabled}
        loadingText={t("oneClickTrading.introduction.startTradingButton")}
      >
        {t("oneClickTrading.introduction.startTradingButton")}
      </Button>
      <p className="px-8 text-caption text-osmoverse-300">
        {t("oneClickTrading.introduction.defaultParameters")} –{" "}
        <Button
          variant="link"
          className="!inline !px-0 !text-caption text-wosmongton-300"
          size="sm"
          onClick={onClickEditParams}
          disabled={isLoading || isDisabled}
        >
          {t("oneClickTrading.introduction.changeButton")}
        </Button>
      </p>
    </div>
  );
};
