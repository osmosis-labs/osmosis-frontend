import { ObservableCreatePoolConfig } from "@osmosis-labs/stores";
import { observer } from "mobx-react-lite";
import { FunctionComponent, useState } from "react";

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

  return (
    <ModalBase
      {...props}
      onRequestClose={() => {
        props.onRequestClose();
      }}
      onRequestBack={curStep !== 0 ? backStep : undefined}
      title={
        config.poolType === "concentrated" ? (
          <div className="relative mx-auto">
            <h6 className="text-center">Create new Supercharged Pool</h6>
          </div>
        ) : (
          props.title
        )
      }
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
      {config.poolType && config.poolType === "concentrated" ? (
        <CreateCLPool />
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
