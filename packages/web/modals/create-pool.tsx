import { FunctionComponent, useState } from "react";
import { observer } from "mobx-react-lite";
import { ObservableCreatePoolConfig } from "@osmosis-labs/stores";
import {
  PoolType,
  SelectType,
  Step1SetRatios,
  Step2AddLiquidity,
  Step3Confirm,
} from "../components/complex/pool/create";
import { ModalBase, ModalBaseProps } from ".";

export const CreatePoolModal: FunctionComponent<
  ModalBaseProps & {
    createPoolConfig: ObservableCreatePoolConfig;
    isSendingMsg?: boolean;
    onCreatePool: () => void;
  }
> = observer((props) => {
  const { createPoolConfig: config, isSendingMsg, onCreatePool } = props;
  const [poolType, setPoolType] = useState<PoolType | null>(null);
  const [curStep, setCurStep] = useState<1 | 2 | 3 | null>(null);
  const advanceStep = () => {
    if (curStep) setCurStep(Math.min(curStep + 1, 3) as 1 | 2 | 3);
  };
  const backStep = () => {
    if (curStep) setCurStep(Math.max(curStep - 1, 0) as 1 | 2 | 3);
  };

  return (
    <ModalBase
      {...props}
      onRequestClose={() => {
        config.clearAssets();
        props.onRequestClose();
      }}
      onRequestBack={curStep && curStep !== 1 ? backStep : undefined}
    >
      {poolType === null && (
        <SelectType
          types={["weighted", "stable"]}
          selectType={(type) => {
            setPoolType(type);
            setCurStep(1);
          }}
        ></SelectType>
      )}
      {curStep === 1 && (
        <Step1SetRatios createPoolConfig={config} advanceStep={advanceStep} />
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
    </ModalBase>
  );
});
