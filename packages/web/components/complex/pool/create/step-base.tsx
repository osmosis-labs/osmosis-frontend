import { FunctionComponent } from "react";
import { observer } from "mobx-react-lite";
import { StepProps } from "./types";
import { Info } from "../../../alert";
import { NewButton } from "../../../buttons";
import { POOL_CREATION_FEE } from ".";
import { useWindowSize } from "../../../../hooks";
import { useTranslation } from "react-multi-lang";

export const StepBase: FunctionComponent<{ step: 1 | 2 | 3 } & StepProps> =
  observer(
    ({
      step,
      createPoolConfig: config,
      isSendingMsg,
      advanceStep,
      children,
    }) => {
      const { isMobile } = useWindowSize();
      const t = useTranslation();
      const positiveBalanceError = t(
        config.positiveBalanceError?.message ?? ""
      );
      const percentageError = t(config.percentageError?.message ?? "");
      const amountError = t(config.amountError?.message ?? "");
      const swapFeeError = t(config.swapFeeError?.message ?? "");

      const canAdvance =
        (step === 1 && !percentageError && !positiveBalanceError) ||
        (step === 2 && !amountError) ||
        (step === 3 && config.acknowledgeFee && !swapFeeError);

      const currentErrorMessage =
        step === 1
          ? percentageError || positiveBalanceError
          : step === 2
          ? amountError
          : swapFeeError;

      return (
        <div className="flex flex-col gap-5">
          <span className="body2 text-center md:caption md:mt-4">
            {step === 1
              ? t("pools.createPool.step.one", {
                  step: step.toString(),
                  nbStep: "3",
                })
              : step === 2
              ? t("pools.createPool.step.two", {
                  step: step.toString(),
                  nbStep: "3",
                })
              : step === 3
              ? t("pools.createPool.step.three", {
                  step: step.toString(),
                  nbStep: "3",
                })
              : null}{" "}
          </span>
          <div>{children}</div>
          {step === 1 && (
            <Info
              message={t("pools.createPool.infoMessage")}
              caption={t("pools.createPool.infoCaption")}
              data={POOL_CREATION_FEE}
              isMobile={isMobile}
            />
          )}
          <NewButton
            onClick={() => advanceStep()}
            disabled={!canAdvance || isSendingMsg}
          >
            {currentErrorMessage
              ? currentErrorMessage
              : step === 3
              ? t("pools.createPool.buttonCreate")
              : t("pools.createPool.buttonNext")}
          </NewButton>
        </div>
      );
    }
  );
