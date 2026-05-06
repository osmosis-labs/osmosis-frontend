import { FunctionComponent, useState } from "react";

import {
  Step1Identity,
  Step2Details,
  Step3SupplyAdmin,
  Step4Confirm,
  Step5Success,
  CreateTokenConfig,
} from "~/components/complex/token/create";
import { ModalBase, ModalBaseProps } from "~/modals";
import { useTranslation } from "~/hooks";

const DEFAULT_CONFIG: CreateTokenConfig = {
  subdenom: "",
  name: "",
  symbol: "",
  decimals: 6,
  description: "",
  uri: "",
  uriHash: "",
  mintEnabled: false,
  mintAmount: "",
  mintRecipient: "",
  changeAdminEnabled: false,
  newAdmin: "",
  acknowledgeFee: false,
};

export const CreateTokenModal: FunctionComponent<
  ModalBaseProps & {
    walletAddress: string;
    isSendingMsg?: boolean;
    onCreateToken: (config: CreateTokenConfig) => void;
    onCreated?: () => void;
  }
> = (props) => {
  const { walletAddress, isSendingMsg, onCreateToken, onCreated } = props;
  const { t } = useTranslation();
  const [curStep, setCurStep] = useState<1 | 2 | 3 | 4 | 5>(1);
  const [completedConfig, setCompletedConfig] =
    useState<CreateTokenConfig | null>(null);
  const [config, setConfigState] = useState<CreateTokenConfig>(DEFAULT_CONFIG);

  const setConfig = (patch: Partial<CreateTokenConfig>) =>
    setConfigState((prev) => ({ ...prev, ...patch }));

  const advanceStep = () => {
    if (curStep < 4) {
      setCurStep((prev) => (prev + 1) as 1 | 2 | 3 | 4 | 5);
    } else {
      setCompletedConfig(config);
      onCreateToken(config);
      setCurStep(5);
    }
  };

  const backStep = () => {
    if (curStep > 1 && curStep < 5)
      setCurStep((prev) => (prev - 1) as 1 | 2 | 3 | 4 | 5);
  };

  const handleRequestClose = () => {
    if (curStep === 5) onCreated?.();
    setCurStep(1);
    setConfigState(DEFAULT_CONFIG);
    setCompletedConfig(null);
    props.onRequestClose();
  };

  const stepProps = {
    config,
    setConfig,
    walletAddress,
    isSendingMsg,
    advanceStep,
  };

  return (
    <ModalBase
      {...props}
      onRequestClose={handleRequestClose}
      onRequestBack={curStep > 1 && curStep < 5 ? backStep : undefined}
      title={curStep < 5 ? t("tokenFactory.create.title") : undefined}
    >
      {curStep === 1 && <Step1Identity {...stepProps} />}
      {curStep === 2 && <Step2Details {...stepProps} />}
      {curStep === 3 && <Step3SupplyAdmin {...stepProps} />}
      {curStep === 4 && <Step4Confirm {...stepProps} />}
      {curStep === 5 && completedConfig && (
        <Step5Success
          config={completedConfig}
          walletAddress={walletAddress}
          onClose={handleRequestClose}
        />
      )}
    </ModalBase>
  );
};
