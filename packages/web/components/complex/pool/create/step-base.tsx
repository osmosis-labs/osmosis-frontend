import { FunctionComponent } from "react";
import { observer } from "mobx-react-lite";
import { StepProps } from "./types";
import { Info } from "../../../alert";
import { Button } from "../../../buttons";
import { POOL_CREATION_FEE } from ".";
import { useWindowSize } from "../../../../hooks";
import { tError } from "../../../localization";
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

      const positiveBalanceError = config.positiveBalanceError
        ? t(...tError(config.positiveBalanceError))
        : undefined;
      const percentageError = config.percentageError
        ? t(...tError(config.percentageError))
        : undefined;
      const scalingFactorError = config.scalingFactorError
        ? t(...tError(config.scalingFactorError))
        : undefined;
      const amountError = config.amountError
        ? t(...tError(config.amountError))
        : undefined;
      const assetCountError = config.assetCountError
        ? t(...tError(config.assetCountError))
        : undefined;
      const swapFeeError = config.swapFeeError
        ? t(...tError(config.swapFeeError))
        : undefined;
      const scalingFactorControllerError = config.scalingFactorControllerError
        ? t(...tError(config.scalingFactorControllerError))
        : undefined;

      const canAdvance =
        (step === 1 &&
          !percentageError &&
          !positiveBalanceError &&
          !assetCountError &&
          !scalingFactorError &&
          !(config.assets.length <= 1)) ||
        (step === 2 && !amountError) ||
        (step === 3 &&
          config.acknowledgeFee &&
          !swapFeeError &&
          !scalingFactorControllerError);

      const currentErrorMessage =
        step === 1
          ? percentageError ||
            positiveBalanceError ||
            assetCountError ||
            scalingFactorError
          : step === 2
          ? amountError
          : swapFeeError || scalingFactorControllerError;

      const urgentErrorMessage =
        step === 1
          ? percentageError || scalingFactorError
          : swapFeeError || scalingFactorControllerError;

      return (
        <div className="flex flex-col gap-5">
          <span className="body2 text-center md:caption md:mt-4">
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
            {currentErrorMessage
              ? currentErrorMessage
              : step === 3
              ? t("pools.createPool.buttonCreate")
              : t("pools.createPool.buttonNext")}
          </Button>
        </div>
      );
    }
  );
