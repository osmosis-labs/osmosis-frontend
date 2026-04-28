import { FunctionComponent, useState } from "react";

import {
  Step1Identity,
  Step2Details,
  Step3SupplyAdmin,
  Step4Confirm,
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
  }
> = (props) => {
  const { walletAddress, isSendingMsg, onCreateToken } = props;
  const { t } = useTranslation();
  const [curStep, setCurStep] = useState<1 | 2 | 3 | 4>(1);
  const [config, setConfigState] = useState<CreateTokenConfig>(DEFAULT_CONFIG);

  const setConfig = (patch: Partial<CreateTokenConfig>) =>
    setConfigState((prev) => ({ ...prev, ...patch }));

  const advanceStep = () => {
    if (curStep < 4) {
      setCurStep((prev) => (prev + 1) as 1 | 2 | 3 | 4);
    } else {
      onCreateToken(config);
    }
  };

  const backStep = () => {
    if (curStep > 1) setCurStep((prev) => (prev - 1) as 1 | 2 | 3 | 4);
  };

  const handleRequestClose = () => {
    setCurStep(1);
    setConfigState(DEFAULT_CONFIG);
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
      onRequestBack={curStep > 1 ? backStep : undefined}
      title={t("tokenFactory.create.title")}
    >
      {curStep === 1 && <Step1Identity {...stepProps} />}
      {curStep === 2 && <Step2Details {...stepProps} />}
      {curStep === 3 && <Step3SupplyAdmin {...stepProps} />}
      {curStep === 4 && <Step4Confirm {...stepProps} />}
    </ModalBase>
  );
};
