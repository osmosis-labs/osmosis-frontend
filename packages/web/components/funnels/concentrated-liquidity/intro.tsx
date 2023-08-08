import Image from "next/image";
import { FunctionComponent } from "react";
import { useTranslation } from "react-multi-lang";

import { Button } from "~/components/buttons";

export const ConcentratedLiquidityIntro: FunctionComponent<{
  onLearnMore: () => void;
  ctaText: string;
  onCtaClick: () => void;
}> = ({ onLearnMore, ctaText, onCtaClick }) => {
  const t = useTranslation();

  return (
    <section className="py-4 px-12 text-center">
      <p className="subtitle1 text-osmoverse-100">
        {t("addConcentratedLiquidityIntro.subtitle")}
      </p>
      <div className="body2 flex flex-col gap-2 py-4">
        <Image
          alt="lab"
          src="/images/number-lab.svg"
          width={562}
          height={240}
        />
        <div className="flex flex-col gap-4 py-8 text-justify text-osmoverse-100">
          <p>{t("addConcentratedLiquidityIntro.body")}</p>
          <p>{t("addConcentratedLiquidityIntro.body2")}</p>
        </div>
      </div>

      <div className="flex items-center gap-4 px-8">
        <div className="relative z-10 w-full before:absolute before:-inset-[1px] before:-z-[1] before:rounded-xl before:bg-gradient-supercharged before:transition-all before:duration-200 before:hover:-inset-[2px]">
          <Button
            size="sm"
            mode="unstyled"
            className="text-ion-100 rounded-xl bg-osmoverse-800 hover:text-white-full"
            onClick={onLearnMore}
          >
            {t("addConcentratedLiquidityIntro.secondaryCta")}
          </Button>
        </div>
        <Button
          className="border-0 bg-gradient-supercharged text-osmoverse-1000 transition-shadow duration-200 ease-in hover:shadow-[0px_0px_15px_0px_rgba(73,197,255,0.50)]"
          size="sm"
          onClick={onCtaClick}
        >
          {ctaText}
        </Button>
      </div>
    </section>
  );
};
