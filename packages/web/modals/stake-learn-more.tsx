import { FunctionComponent } from "react";

import { StakeLearnMore } from "~/components/cards/stake-learn-more";
import { ModalBase, ModalBaseProps } from "~/modals/base";

interface ExtendedModalBaseProps extends ModalBaseProps {}

export const StakeLearnMoreModal: FunctionComponent<ExtendedModalBaseProps> = ({
  onRequestClose,
  isOpen,
}) => {
  return (
    <ModalBase
      // title={title}
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      className="rounded-[32px] p-0"
    >
      <StakeLearnMore />
    </ModalBase>
  );
};
