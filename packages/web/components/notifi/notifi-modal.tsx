import { FunctionComponent } from "react";

import { ModalBase, ModalBaseProps } from "~/modals";

import { useNotifiModalContext } from "./notifi-modal-context";
import { NotifiSubscriptionCard } from "./notifi-subscription-card";

export const NotifiModal: FunctionComponent<ModalBaseProps> = (props) => {
  const { innerState } = useNotifiModalContext();
  const finalProps = { ...props, ...innerState };

  return (
    <ModalBase {...finalProps}>
      <div className="mt-4 flex max-h-96 flex-col overflow-y-auto">
        <NotifiSubscriptionCard />
      </div>
    </ModalBase>
  );
};
