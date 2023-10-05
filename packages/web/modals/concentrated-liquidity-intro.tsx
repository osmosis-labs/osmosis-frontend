import { FunctionComponent } from "react";

import { ConcentratedLiquidityLearnMore } from "~/components/funnels/concentrated-liquidity";
import { useMultiLanguage } from "~/hooks";
import { ModalBase, ModalBaseProps } from "~/modals/base";

/** CL intro with just learn more instagram feed. */
export const ConcentratedLiquidityLearnMoreModal: FunctionComponent<
  ModalBaseProps
> = (props) => {
  const { t } = useMultiLanguage();

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
