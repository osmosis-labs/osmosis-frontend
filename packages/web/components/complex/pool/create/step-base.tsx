import { FunctionComponent } from "react";
import { observer } from "mobx-react-lite";
import { StepProps } from "./types";
import { Info, Error } from "../../../alert";
import { Button } from "../../../buttons";
import { POOL_CREATION_FEE } from ".";
import { useWindowSize } from "../../../../hooks";
import { useTranslation } from "react-multi-lang";

export const StepBase: FunctionComponent<{ step: 1 | 2 | 3 } & StepProps> =
  observer(
    ({
      step,
      createPoolConfig: config,
      isSendingMsg,
      backStep,
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

      return (
        <div className="flex flex-col gap-5">
          <span className="body2 md:caption md:mt-4">
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
          <Info
            message={t("pools.createPool.infoMessage")}
            caption={t("pools.createPool.infoCaption")}
            data={POOL_CREATION_FEE}
            isMobile={isMobile}
          />
          <div>{children}</div>
          {positiveBalanceError && step === 1 && (
            <Error className="mx-auto" message={positiveBalanceError} />
          )}
          {!positiveBalanceError && percentageError && step === 1 && (
            <Error className="mx-auto" message={percentageError} />
          )}
          {amountError && step === 2 && (
            <Error className="mx-auto" message={amountError} />
          )}
          {swapFeeError && step === 3 && (
            <Error className="mx-auto" message={swapFeeError} />
          )}
          <div className="flex gap-4 mx-auto">
            {step !== 1 && (
              <Button
                className="w-28 md:w-20 bg-secondary-200 hover:bg-secondary-100"
                size={isMobile ? "sm" : "lg"}
                disabled={isSendingMsg}
                onClick={() => backStep()}
              >
                {t("pools.createPool.buttonBack")}
              </Button>
            )}
            <Button
              className="w-80 md:w-36 md:h-10"
              size={isMobile ? "sm" : "lg"}
              onClick={() => advanceStep()}
              loading={isSendingMsg}
              disabled={!canAdvance || isSendingMsg}
            >
              {step === 3
                ? t("pools.createPool.buttonCreate")
                : t("pools.createPool.buttonNext")}
            </Button>
          </div>
        </div>
      );
    }
  );
