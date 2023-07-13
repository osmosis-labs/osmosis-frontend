import { useFlags } from "launchdarkly-react-client-sdk";
import { FunctionComponent, useState } from "react";
import { useTranslation } from "react-multi-lang";

import {
  ConcentratedLiquidityIntro,
  ConcentratedLiquidityLearnMore,
} from "~/components/funnels/concentrated-liquidity";
import { EventName } from "~/config";
import { useAmplitudeAnalytics, useLocalStorageState } from "~/hooks";

import { ModalBase, ModalBaseProps } from "./base";

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
  const featureFlags = useFlags();
  const t = useTranslation();
  const { logEvent } = useAmplitudeAnalytics();

  // concentrated liquidity intro
  const [showConcentratedLiqIntro_, setConcentratedLiqIntroViewed] =
    useLocalStorageState(
      featureFlags.concentratedLiquidity && persistShowState
        ? "concentrated-liquidity-intro"
        : "",
      featureFlags.concentratedLiquidity
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
      isOpen={featureFlags.concentratedLiquidity && showSelf}
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
        <ConcentratedLiquidityLearnMore />
      ) : (
        <ConcentratedLiquidityIntro
          onLearnMore={() => {
            logEvent([EventName.ConcentratedLiquidity.introLearnClicked]);
            setShowLearnMore(true);
          }}
          ctaText={ctaText}
          onCtaClick={() => {
            logEvent([EventName.ConcentratedLiquidity.introExploreClicked]);
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
      <ConcentratedLiquidityLearnMore />
    </ModalBase>
  );
};
