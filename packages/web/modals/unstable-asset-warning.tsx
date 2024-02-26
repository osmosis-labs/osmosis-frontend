import { FunctionComponent } from "react";

import { Button } from "~/components/ui/button";
import { useTranslation } from "~/hooks";
import { ModalBase, ModalBaseProps } from "~/modals/base";

interface ExtendedModalBaseProps extends ModalBaseProps {
  onContinue: () => void;
  type: "deposit" | "withdraw";
}

export const UnstableAssetWarning: FunctionComponent<
  ExtendedModalBaseProps
> = ({ onRequestClose, isOpen, onContinue }) => {
  const { t } = useTranslation();

  return (
    <ModalBase
      title={"Transfers Unstable"}
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      className="flex max-w-[428px] flex-col items-center gap-6 text-center"
      hideCloseButton
    >
      <p className="text-base text-osmoverse-200">
        You may experience significant delays or transaction failure. Proceed at
        your own risk.
      </p>
      <div className="flex w-full flex-col gap-2">
        <Button
          variant="destructive"
          onClick={(event) => {
            event.preventDefault();
            event.stopPropagation();
            onContinue();
            onRequestClose();
          }}
        >
          Deposit Anyway / Withdraw Anyway
        </Button>
        <Button
          variant="ghost"
          onClick={(event) => {
            event.preventDefault();
            event.stopPropagation();
            onRequestClose();
          }}
        >
          Cancel
        </Button>
      </div>
    </ModalBase>
  );
};
