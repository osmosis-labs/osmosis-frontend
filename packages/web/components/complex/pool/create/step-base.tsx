import { FunctionComponent } from "react";
import { observer } from "mobx-react-lite";
import { StepProps } from "./types";
import { Info, Error } from "../../../alert";
import { Button } from "../../../buttons";
import { POOL_CREATION_FEE } from ".";
import { useWindowSize } from "../../../../hooks";

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

      const positiveBalanceError = config.positiveBalanceError?.message;
      const percentageError = config.percentageError?.message;
      const amountError = config.amountError?.message;
      const swapFeeError = config.swapFeeError?.message;
      const canAdvance =
        (step === 1 && !percentageError && !positiveBalanceError) ||
        (step === 2 && !amountError) ||
        (step === 3 && config.acknowledgeFee && !swapFeeError);

      return (
        <div className="flex flex-col gap-5">
          <span className="body2 text-center md:caption md:mt-4">
            Step {step} / 3 -
            {step === 1
              ? " Set token ratios"
              : step === 2
              ? " Input amount to add"
              : step === 3
              ? " Confirm pool ratio and token amount"
              : null}{" "}
          </span>
          {step === 1 ||
            (step === 3 && (
              <Info
                message="Pool Creation Fee"
                caption="Transferred to the Osmosis community pool"
                data={POOL_CREATION_FEE}
                isMobile={isMobile}
              />
            ))}
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
            <Button
              className="w-80 md:w-36 md:h-10"
              size={isMobile ? "sm" : "lg"}
              onClick={() => advanceStep()}
              loading={isSendingMsg}
              disabled={!canAdvance || isSendingMsg}
            >
              {step === 3 ? "Create Pool" : "Next"}
            </Button>
          </div>
        </div>
      );
    }
  );
