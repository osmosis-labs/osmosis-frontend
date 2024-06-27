import { useCallback } from "react";
import { FunctionComponent } from "react";

import { Button } from "~/components/ui/button";
import { EventName } from "~/config";
import { useTranslation } from "~/hooks";
import { useAmplitudeAnalytics } from "~/hooks";
import { ModalBase, ModalBaseProps } from "~/modals/base";

interface ExtendedModalBaseProps extends ModalBaseProps {
  setShowValidatorModal: () => void;
  isNewUser: boolean;
  stakeCall: () => void;
  setShowStakeLearnMoreModal: () => void;
}

export const ValidatorNextStepModal: FunctionComponent<
  ExtendedModalBaseProps
> = ({
  onRequestClose,
  isOpen,
  setShowValidatorModal,
  isNewUser,
  stakeCall,
  setShowStakeLearnMoreModal,
}) => {
  const { t } = useTranslation();

  const { logEvent } = useAmplitudeAnalytics();

  const title = isNewUser
    ? t("stake.validatorNextStep.newUser.title")
    : t("stake.validatorNextStep.existingUser.title");

  const handleNewUserClick = useCallback(() => {
    logEvent([EventName.Stake.buildSquadClicked]);
    onRequestClose();
    setShowValidatorModal(); // select squad and stake
  }, [logEvent, setShowValidatorModal, onRequestClose]);

  const handleExistingUserKeepClick = useCallback(() => {
    logEvent([EventName.Stake.squadOptionClicked, { option: "keep" }]);
    localStorage.setItem("keepValidators", "true");
    onRequestClose();
    stakeCall();
  }, [logEvent, onRequestClose, stakeCall]);

  const handleExistingUserSelectClick = useCallback(() => {
    logEvent([EventName.Stake.squadOptionClicked, { option: "new" }]);
    onRequestClose();
    setShowValidatorModal();
  }, [logEvent, onRequestClose, setShowValidatorModal]);

  return (
    <ModalBase
      title={title}
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      className="flex flex-col items-center gap-8 text-center"
      hideCloseButton
    >
      {isNewUser ? (
        <>
          <p className="text-base font-thin">
            {t("stake.validatorNextStep.newUser.description")}{" "}
          </p>
          <Button
            variant="link"
            onClick={() => {
              onRequestClose();
              setShowStakeLearnMoreModal();
            }}
          >
            {t("stake.validatorNextStep.newUser.learnMore")} {"->"}
          </Button>
          <Button variant="success" onClick={handleNewUserClick}>
            {t("stake.validatorNextStep.newUser.button")}
          </Button>
        </>
      ) : (
        <>
          <p className="text-base font-thin">
            {t("stake.validatorNextStep.existingUser.description")}
          </p>
          <div className="flex w-full gap-8 md:gap-2">
            <Button
              className="w-full"
              variant="success"
              onClick={handleExistingUserKeepClick}
            >
              {t("stake.validatorNextStep.existingUser.buttonKeep")}
            </Button>
            <Button
              className="w-full"
              variant="success"
              onClick={handleExistingUserSelectClick}
            >
              {t("stake.validatorNextStep.existingUser.buttonSelect")}
            </Button>
          </div>
        </>
      )}
    </ModalBase>
  );
};
