import Link from "next/link";
import { FunctionComponent } from "react";
import { useTranslation } from "react-multi-lang";

import { Button } from "~/components/buttons";
import { EventName } from "~/config";
import { useAmplitudeAnalytics } from "~/hooks";
import { ModalBase, ModalBaseProps } from "~/modals/base";
interface ExtendedModalBaseProps extends ModalBaseProps {
  setShowValidatorModal: (val: boolean) => void;
  isNewUser: boolean;
}

export const ValidatorNextStepModal: FunctionComponent<
  ExtendedModalBaseProps
> = ({
  onRequestClose,
  isOpen,
  setShowValidatorModal,
  isNewUser,
}) => {
  const t = useTranslation();

  const { logEvent } = useAmplitudeAnalytics();

  const title = isNewUser
    ? t("stake.validatorNextStep.newUser.title")
    : t("stake.validatorNextStep.existingUser.title");

  return (
    <ModalBase
      title={title}
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      className="flex flex-col items-center gap-[32px] text-center"
      hideCloseButton
    >
      {isNewUser ? (
        <>
          <p className="text-base font-thin">
            {t("stake.validatorNextStep.newUser.description")}{" "}
            <Link href="">
              <a className="text-bullish-200 underline">
                {/* TODO - add link to learn here */}
                {t("stake.validatorNextStep.newUser.learnMore")} {"->"}
              </a>
            </Link>
          </p>
          <Button
            mode="primary-bullish"
            onClick={() => {
              logEvent([EventName.Stake.buildSquadClicked]);
              onRequestClose();
              setShowValidatorModal(true);
            }}
            className="w-[383px]"
          >
            {t("stake.validatorNextStep.newUser.button")}
          </Button>
        </>
      ) : (
        <>
          <p className="text-base font-thin">
            {t("stake.validatorNextStep.existingUser.description")}
          </p>
          <div className="flex w-full gap-8">
            <Button
              className="w-full"
              mode="primary-bullish"
              onClick={() => {
                logEvent([EventName.Stake.squadOptionClicked, { option: "keep" }])
                onRequestClose();
                alert("make stake call now");
              }}
            >
              {t("stake.validatorNextStep.existingUser.buttonKeep")}
            </Button>
            <Button
              className="w-full"
              mode="secondary-bullish"
              onClick={() => {
                logEvent([EventName.Stake.squadOptionClicked, { option: "new" }])
                onRequestClose();
                setShowValidatorModal(true);
              }}
            >
              {t("stake.validatorNextStep.existingUser.buttonSelect")}
            </Button>
          </div>
        </>
      )}
    </ModalBase>
  );
};
