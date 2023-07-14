import { observer } from "mobx-react-lite";
import { FunctionComponent } from "react";
import { useTranslation } from "react-multi-lang";

import { Info } from "~/components/alert";
import { Button } from "~/components/buttons";
import { StepProps } from "~/components/complex/pool/create/types";
import { tError } from "~/components/localization";
import { useWindowSize } from "~/hooks";

import { POOL_CREATION_FEE } from ".";

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

      const canAdvance =
        (step === 1 &&
          !config.percentageError &&
          !config.positiveBalanceError &&
          !config.assetCountError &&
          !config.scalingFactorError &&
          !(config.assets.length <= 1)) ||
        (step === 2 && !config.amountError) ||
        (step === 3 &&
          config.acknowledgeFee &&
          !config.swapFeeError &&
          !config.scalingFactorControllerError);

      const currentError =
        step === 1
          ? config.percentageError ||
            config.positiveBalanceError ||
            config.assetCountError ||
            config.scalingFactorError
          : step === 2
          ? config.amountError
          : config.swapFeeError || config.scalingFactorControllerError;

      const urgentErrorMessage =
        step === 1
          ? config.scalingFactorError
          : config.swapFeeError || config.scalingFactorControllerError;

      return (
        <div className="flex flex-col gap-5">
          <span className="body2 md:caption text-center md:mt-4">
            {step === 1
              ? config.poolType === "weighted"
                ? t("pools.createPool.step.one.weighted", {
                    step: step.toString(),
                    nbStep: "3",
                  })
                : t("pools.createPool.step.one.stable", {
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
          <Button
            onClick={() => advanceStep()}
            mode={
              !canAdvance && urgentErrorMessage ? "primary-warning" : undefined
            }
            disabled={!canAdvance || isSendingMsg}
          >
            {currentError
              ? t(...tError(currentError))
              : step === 3
              ? t("pools.createPool.buttonCreate")
              : t("pools.createPool.buttonNext")}
          </Button>
        </div>
      );
    }
  );
