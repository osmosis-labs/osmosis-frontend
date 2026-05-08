import { FunctionComponent, useEffect, useState } from "react";

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
  // UX convenience default for the creation form — not a protocol assumption.
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
    /** Called after the modal closes following a confirmed successful tx. */
    onCreated?: () => void;
    /**
     * When true the modal advances from step 4 → 5 (tx confirmed on-chain).
     * When a non-empty string, shows that string as an error on step 4.
     * Parent resets this to null after the modal handles it.
     */
    txResult?: "success" | string | null;
  }
> = (props) => {
  const { walletAddress, isSendingMsg, onCreateToken, onCreated, txResult } =
    props;
  const { t } = useTranslation();
  const [curStep, setCurStep] = useState<1 | 2 | 3 | 4 | 5>(1);
  const [completedConfig, setCompletedConfig] =
    useState<CreateTokenConfig | null>(null);
  const [config, setConfigState] = useState<CreateTokenConfig>(DEFAULT_CONFIG);
  const [txError, setTxError] = useState<string | null>(null);

  useEffect(() => {
    if (txResult === "success" && curStep === 4) {
      setCurStep(5);
      setTxError(null);
    } else if (txResult && txResult !== "success" && curStep === 4) {
      setTxError(txResult);
    }
  }, [txResult]); // eslint-disable-line react-hooks/exhaustive-deps

  const setConfig = (patch: Partial<CreateTokenConfig>) =>
    setConfigState((prev) => ({ ...prev, ...patch }));

  const advanceStep = () => {
    if (curStep < 4) {
      setCurStep((prev) => (prev + 1) as 1 | 2 | 3 | 4 | 5);
    } else {
      // Capture config and fire tx — do NOT advance to step 5 yet.
      // The parent sets txResult="success" after confirmed on-chain success.
      setCompletedConfig(config);
      setTxError(null);
      onCreateToken(config);
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
    setTxError(null);
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
      {curStep === 4 && (
        <>
          <Step4Confirm {...stepProps} />
          {txError && (
            <p className="caption mt-3 text-center text-missionError">
              {txError}
            </p>
          )}
        </>
      )}
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
