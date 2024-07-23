import { ObservableCreatePoolConfig } from "@osmosis-labs/stores";
import classNames from "classnames";
import { observer } from "mobx-react-lite";
import { FunctionComponent, useMemo, useState } from "react";

import {
  SelectType,
  Step1SetRatios,
  Step2AddLiquidity,
  Step3Confirm,
} from "~/components/complex";
import { CreateCLPool } from "~/components/complex/pool/create/cl-pool";
import { ModalBase, ModalBaseProps } from "~/modals";

export const CreatePoolModal: FunctionComponent<
  ModalBaseProps & {
    createPoolConfig: ObservableCreatePoolConfig;
    isSendingMsg?: boolean;
    onCreatePool: () => void;
  }
> = observer((props) => {
  const { createPoolConfig: config, isSendingMsg, onCreatePool } = props;
  const [curStep, setCurStep] = useState<1 | 2 | 3 | 0>(
    config.poolType ? 1 : 0
  );
  const advanceStep = () => {
    if (curStep > 0) setCurStep(Math.min(curStep + 1, 3) as 1 | 2 | 3);
  };
  const backStep = () => {
    if (curStep > 0) {
      if (curStep === 1) {
        config.setPoolType(null);
      }
      setCurStep(Math.max(curStep - 1, 0) as 1 | 2 | 3);
    }
  };

  const isConcentrated = useMemo(
    () => config.poolType === "concentrated",
    [config.poolType]
  );

  return (
    <ModalBase
      {...props}
      onRequestClose={() => {
        if (isConcentrated) {
          setCurStep(1);
        }
        props.onRequestClose();
      }}
      onRequestBack={
        isConcentrated ? undefined : curStep !== 0 ? backStep : undefined
      }
      title={!isConcentrated ? props.title : undefined}
      hideCloseButton={isConcentrated}
      className={classNames({
        "!w-fit !max-w-none !overflow-visible !bg-osmoverse-850 !p-0":
          isConcentrated,
      })}
    >
      {config.poolType === null && (
        <SelectType
          types={["weighted", "stable", "concentrated"]}
          selectType={(type) => {
            config.setPoolType(type);
            setCurStep(1);
          }}
        />
      )}
      {config.poolType && isConcentrated ? (
        <CreateCLPool
          onBack={() => {
            if (curStep !== 0) {
              backStep();
            }
          }}
          advanceStep={advanceStep}
          backStep={backStep}
          currentStep={curStep}
          onClose={props.onRequestClose}
          config={config}
          fullClose={() => {
            setCurStep(1);
            props.onRequestClose();
          }}
        />
      ) : (
        <>
          {curStep === 1 && (
            <Step1SetRatios
              createPoolConfig={config}
              advanceStep={advanceStep}
            />
          )}
          {curStep === 2 && (
            <Step2AddLiquidity
              createPoolConfig={config}
              advanceStep={advanceStep}
            />
          )}
          {curStep === 3 && (
            <Step3Confirm
              createPoolConfig={config}
              isSendingMsg={isSendingMsg}
              advanceStep={onCreatePool}
            />
          )}
        </>
      )}
    </ModalBase>
  );
});
