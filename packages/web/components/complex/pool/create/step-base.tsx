import { FunctionComponent } from "react";
import { observer } from "mobx-react-lite";
import { StepProps } from "./types";
import { Info } from "../../../alert";
import { NewButton } from "../../../buttons";
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

      const currentErrorMessage =
        step === 1
          ? percentageError || positiveBalanceError
          : step === 2
          ? amountError
          : swapFeeError;

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
          <div>{children}</div>
          {(step === 1 || step === 3) && (
            <Info
              message="Pool Creation Fee"
              caption="Transferred to the Osmosis community pool"
              data={POOL_CREATION_FEE}
              isMobile={isMobile}
            />
          )}
          <NewButton
            className="w-full h-16"
            onClick={() => advanceStep()}
            disabled={!canAdvance || isSendingMsg}
          >
            {currentErrorMessage
              ? currentErrorMessage
              : step === 3
              ? "Create Pool"
              : "Next"}
          </NewButton>
        </div>
      );
    }
  );
