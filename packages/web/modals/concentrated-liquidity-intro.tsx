import { FunctionComponent } from "react";
import { useTranslation } from "react-multi-lang";

import { ConcentratedLiquidityLearnMore } from "~/components/funnels/concentrated-liquidity";
import { ModalBase, ModalBaseProps } from "~/modals/base";

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
