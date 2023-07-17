import { useRouter } from "next/router";
import { FunctionComponent, useState } from "react";
import { useTranslation } from "react-multi-lang";

import {
  ConcentratedLiquidityIntro,
  ConcentratedLiquidityLearnMore,
} from "~/components/funnels/concentrated-liquidity";
import { EventName } from "~/config";
import { useAmplitudeAnalytics, useLocalStorageState } from "~/hooks";
import { useFeatureFlags } from "~/hooks/use-feature-flags";
import { ModalBase, ModalBaseProps } from "~/modals/base";

/** Use this modal to show an intro to a new feature. */
export const ConcentratedLiquidityIntroModal: FunctionComponent<{
  persistShowState?: boolean;
  showFromPoolDetail?: boolean;
  onCloseFromPoolDetail?: () => void;
  ctaText: string;
  onCtaClick: () => void;
}> = ({
  persistShowState = true,
  showFromPoolDetail = false,
  onCloseFromPoolDetail,
  ctaText,
  onCtaClick,
}) => {
  const t = useTranslation();

  const router = useRouter();

  const flags = useFeatureFlags();
  const { logEvent } = useAmplitudeAnalytics({
    onLoadEvent: [EventName.ConcentratedLiquidity.introModalViewed],
  });

  // concentrated liquidity intro
  const [showConcentratedLiqIntro_, setConcentratedLiqIntroViewed] =
    useLocalStorageState(
      flags.concentratedLiquidity && persistShowState
        ? "concentrated-liquidity-intro"
        : "",
      flags.concentratedLiquidity
    );

  const showConcentratedLiqIntro =
    showFromPoolDetail || showConcentratedLiqIntro_;
  const closeIntro =
    onCloseFromPoolDetail ?? (() => setConcentratedLiqIntroViewed(false));

  // learn more instagram reel
  const [showLearnMore, setShowLearnMore] = useState(false);

  const showSelf = showConcentratedLiqIntro || showLearnMore;

  return (
    <ModalBase
      isOpen={flags.concentratedLiquidity && showSelf}
      title={
        showLearnMore
          ? t("addConcentratedLiquidityIntro.learnMoreTitle")
          : showFromPoolDetail
          ? t("addConcentratedLiquidityIntro.poolDetailTitle")
          : t("addConcentratedLiquidityIntro.title")
      }
      onRequestClose={() => {
        logEvent([EventName.ConcentratedLiquidity.introClosed]);
        if (showLearnMore) {
          setShowLearnMore(false);
        } else {
          closeIntro();
        }
      }}
    >
      {showLearnMore ? (
        <ConcentratedLiquidityLearnMore
          onClickLastSlide={() => {
            logEvent([
              EventName.ConcentratedLiquidity.learnMoreFinished,
              { completed: true },
            ]);
            setShowLearnMore(false);
          }}
        />
      ) : (
        <ConcentratedLiquidityIntro
          onLearnMore={() => {
            logEvent([
              EventName.ConcentratedLiquidity.learnMoreCtaClicked,
              {
                sourcePage: router.pathname.includes("pools")
                  ? "Pools"
                  : router.pathname.includes("pool")
                  ? "Pool Details"
                  : "Trade",
              },
            ]);
            setShowLearnMore(true);
          }}
          ctaText={ctaText}
          onCtaClick={() => {
            onCtaClick();
            closeIntro();
          }}
        />
      )}
    </ModalBase>
  );
};

/** CL intro with just learn more instagram feed. */
export const ConcentratedLiquidityLearnMoreModal: FunctionComponent<
  ModalBaseProps
> = (props) => {
  const t = useTranslation();

  return (
    <ModalBase
      title={t("addConcentratedLiquidityIntro.learnMoreTitle")}
      {...props}
    >
      <ConcentratedLiquidityLearnMore
        onClickLastSlide={() => props?.onRequestClose?.()}
      />
    </ModalBase>
  );
};
