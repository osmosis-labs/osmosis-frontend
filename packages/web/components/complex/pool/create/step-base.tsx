import { FunctionComponent } from "react";
import { observer } from "mobx-react-lite";
import { StepProps } from "./types";
import { Info, Error } from "../../../alert";
import { Button } from "../../../buttons";
import { POOL_CREATION_FEE } from ".";

export const StepBase: FunctionComponent<{ step: 1 | 2 | 3 } & StepProps> =
  observer(
    ({ step, createPoolConfig: config, backStep, advanceStep, children }) => {
      const amountError = config.getErrorOfAmount()?.message;
      const percentageError = config.getErrorOfPercentage()?.message;
      const canAdvance =
        (step === 1 && !percentageError) ||
        (step === 2 && !amountError) ||
        (step === 3 && config.acknowledgeFee);

      return (
        <div className="flex flex-col gap-5">
          <span className="body2">
            Step {step} / 3 -
            {step === 1
              ? " Set token ratios"
              : step === 2
              ? " Input amount to add"
              : step === 3
              ? " Confirm pool ratio and token amount"
              : null}{" "}
          </span>
          <Info
            message="Pool Creation Fee"
            caption="Transferred to the Osmosis community pool"
            data={POOL_CREATION_FEE}
          />
          <div>{children}</div>
          {percentageError && step === 1 && (
            <Error className="mx-auto" message={percentageError} />
          )}
          {amountError && step === 2 && (
            <Error className="mx-auto" message={amountError} />
          )}
          <div className="flex gap-4 mx-auto">
            {step !== 1 && (
              <Button
                className="w-28 bg-secondary-200 hover:bg-secondary-100"
                size="lg"
                onClick={() => backStep()}
              >
                Back
              </Button>
            )}
            <Button
              className="w-80"
              size="lg"
              onClick={() => advanceStep()}
              disabled={!canAdvance}
            >
              {step === 3 ? "Create Pool" : "Next"}
            </Button>
          </div>
        </div>
      );
    }
  );
