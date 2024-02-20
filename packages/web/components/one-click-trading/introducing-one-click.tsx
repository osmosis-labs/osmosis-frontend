import Image from "next/image";

import { Button, buttonCVA } from "~/components/buttons";
import { Pill } from "~/components/indicators/pill";
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
      <h2 className="text-body2 font-body2 text-osmoverse-200">
        {t("oneClickTrading.introduction.introducingSubtitle")}{" "}
        <a
          className={buttonCVA({
            mode: "text",
            className: "!inline w-auto px-0 text-body2 font-body2",
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
      <p className="text-caption text-osmoverse-300">
        {t("oneClickTrading.introduction.activeHourLimit")} –{" "}
        <Button
          mode="text"
          className="!inline"
          onClick={onClickEditParams}
          disabled={isLoading || isDisabled}
        >
          {t("oneClickTrading.introduction.changeButton")}
        </Button>
      </p>
    </div>
  );
};
