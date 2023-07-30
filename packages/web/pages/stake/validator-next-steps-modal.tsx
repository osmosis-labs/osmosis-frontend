import { Staking } from "@keplr-wallet/stores";
import { observer } from "mobx-react-lite";
import Link from "next/link";
import { FunctionComponent } from "react";
import { useTranslation } from "react-multi-lang";

import { Button } from "~/components/buttons";
import { ModalBase, ModalBaseProps } from "~/modals/base";

interface ExtendedModalBaseProps extends ModalBaseProps {
  usersValidatorsMap: Map<string, Staking.Delegation>;
}

export const ValidatorNextStepModal: FunctionComponent<ExtendedModalBaseProps> =
  observer((props) => <ValidatorSquadContent {...props} />);

interface ValidatorSquadContentProps {
  onRequestClose: () => void;
  isOpen: boolean;
  usersValidatorsMap: Map<string, Staking.Delegation>;
}

const ValidatorSquadContent: FunctionComponent<ValidatorSquadContentProps> =
  observer(({ onRequestClose, isOpen, usersValidatorsMap }) => {
    // i18n
    const t = useTranslation();

    console.log("size: ", usersValidatorsMap.size);

    return (
      <ModalBase
        title={"It looks like you're new here"}
        isOpen={isOpen}
        onRequestClose={onRequestClose}
        className="flex !max-w-[481px] flex-col gap-[32px] text-center"
      >
        <p>
          Select a squad of validators to begin staking. Not sure what
          validators are?{" "}
          <Link href="">
            <a className="text-bullish-200">
              Click here to learn how staking works
            </a>
          </Link>
        </p>
        <Button
          mode="special-1"
          onClick={() => console.log("set squad")}
          className="w-[383px]"
        >
          Build stake squad to continue
        </Button>
      </ModalBase>
    );
  });
