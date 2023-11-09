import { FunctionComponent } from "react";

import { StakeLearnMore } from "~/components/cards/stake-learn-more";
import { ModalBase, ModalBaseProps } from "~/modals/base";

interface ExtendedModalBaseProps extends ModalBaseProps {
  isWalletConnected: boolean;
  setShowValidatorModal: () => void;
}

export const StakeLearnMoreModal: FunctionComponent<ExtendedModalBaseProps> = ({
  onRequestClose,
  isOpen,
  isWalletConnected,
  setShowValidatorModal,
}) => {
  return (
    <ModalBase isOpen={isOpen} onRequestClose={onRequestClose}>
      <StakeLearnMore
        modal
        isWalletConnected={isWalletConnected}
        setShowValidatorModal={() => {
          onRequestClose();
          setShowValidatorModal();
        }}
      />
    </ModalBase>
  );
};
