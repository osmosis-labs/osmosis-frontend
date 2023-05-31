import { useFlags } from "launchdarkly-react-client-sdk";
import { FunctionComponent, useState } from "react";
import { useTranslation } from "react-multi-lang";

import {
  ConcentratedLiquidityIntro,
  ConcentratedLiquidityLearnMore,
} from "~/components/funnels/concentrated-liquidity";
import { useLocalStorageState } from "~/hooks";

import { ModalBase } from "./base";

/** Use this modal to show an intro to a new feature. */
export const ConcentratedLiquidityIntroModal: FunctionComponent<{
  showFromPoolDetail?: boolean;
  onCloseFromPoolDetail?: () => void;
  ctaText: string;
  onCtaClick: () => void;
}> = ({
  showFromPoolDetail = false,
  onCloseFromPoolDetail,
  ctaText,
  onCtaClick,
}) => {
  const featureFlags = useFlags();
  const t = useTranslation();

  // concentrated liquidity intro
  const [showConcentratedLiqIntro_, setConcentratedLiqIntroViewed] =
    useLocalStorageState(
      featureFlags.concentratedLiquidity ? "concentrated-liquidity-intro" : "",
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
          ? undefined
          : showFromPoolDetail
          ? t("addConcentratedLiquidityIntro.poolDetailTitle")
          : t("addConcentratedLiquidityIntro.title")
      }
      onRequestClose={() => {
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
          onLearnMore={() => setShowLearnMore(true)}
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
