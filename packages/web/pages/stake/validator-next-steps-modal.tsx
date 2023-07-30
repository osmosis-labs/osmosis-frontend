import { Staking } from "@keplr-wallet/stores";
import { observer } from "mobx-react-lite";
import Link from "next/link";
import { FunctionComponent } from "react";
import { useTranslation } from "react-multi-lang";

import { Button } from "~/components/buttons";
import { ModalBase, ModalBaseProps } from "~/modals/base";

interface ExtendedModalBaseProps extends ModalBaseProps {
  usersValidatorsMap: Map<string, Staking.Delegation>;
  setShowValidatorModal: (val: boolean) => void;
}

export const ValidatorNextStepModal: FunctionComponent<ExtendedModalBaseProps> =
  observer((props) => <ValidatorSquadContent {...props} />);

interface ValidatorSquadContentProps {
  onRequestClose: () => void;
  isOpen: boolean;
  usersValidatorsMap: Map<string, Staking.Delegation>;
  setShowValidatorModal: (val: boolean) => void;
}

const ValidatorSquadContent: FunctionComponent<ValidatorSquadContentProps> =
  observer(
    ({ onRequestClose, isOpen, usersValidatorsMap, setShowValidatorModal }) => {
      // i18n
      const t = useTranslation();

      const isEmpty = usersValidatorsMap.size === 0;

      const title = isEmpty
        ? "It looks like you're new here"
        : "It looks like you’ve staked before";

      return (
        <ModalBase
          title={title}
          isOpen={isOpen}
          onRequestClose={onRequestClose}
          className="flex flex-col items-center gap-[32px] text-center"
          hideCloseButton
        >
          {isEmpty ? (
            <>
              <p className="text-base font-thin">
                Select a squad of validators to begin staking. Not sure what
                validators are?{" "}
                <Link
                  href=""
                  // TODO - add link to learn here
                >
                  <a className="text-bullish-200 underline">
                    Click here to learn how staking works {"->"}
                  </a>
                </Link>
              </p>
              <Button
                mode="primary-bullish"
                onClick={() => {
                  onRequestClose();
                  setShowValidatorModal(true);
                }}
                className="w-[383px]"
              >
                Build stake squad to continue
              </Button>
            </>
          ) : (
            <>
              <p className="text-base font-thin">
                We’ve detected an existing stake squad associated with your
                wallet address. Would you like to keep the same validators on
                Osmosis?
              </p>
              <div className="flex w-full gap-8">
                <Button
                  className="w-full"
                  mode="primary-bullish"
                  onClick={() => {
                    onRequestClose();
                    alert("make staking call now");
                  }}
                >
                  Keep Existing Validators
                </Button>
                <Button
                  className="w-full"
                  mode="secondary-bullish"
                  onClick={() => {
                    onRequestClose();
                    setShowValidatorModal(true);
                  }}
                >
                  Select New Validators
                </Button>
              </div>
            </>
          )}
        </ModalBase>
      );
    }
  );
