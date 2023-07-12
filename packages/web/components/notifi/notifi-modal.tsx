import { FunctionComponent } from "react";

import { ModalBase, ModalBaseProps } from "~/modals";

import { Icon } from "../assets";
import IconButton from "../buttons/icon-button";
import { useNotifiModalContext } from "./notifi-modal-context";
import { NotifiSubscriptionCard } from "./notifi-subscription-card";

export const NotifiModal: FunctionComponent<ModalBaseProps> = (props) => {
  const { innerState } = useNotifiModalContext();
  const finalProps = { ...props, ...innerState };

  const { innerState: { onRequestBack, backIcon } = {}, setIsOverLayEnabled } =
    useNotifiModalContext();

  return (
    <ModalBase
      isOpen={finalProps.isOpen}
      onRequestClose={() => {
        finalProps.onRequestClose();
        setIsOverLayEnabled(false);
      }}
      title={finalProps.title}
    >
      <div className="mt-4 flex max-h-96 flex-col overflow-y-auto">
        {onRequestBack && (
          <IconButton
            aria-label="Back"
            mode="unstyled"
            size="unstyled"
            className={`top-9.5 absolute ${
              backIcon !== "setting" ? "left" : "right"
            }-8 z-50 mt-1 w-fit rotate-180 cursor-pointer py-0 text-osmoverse-400 md:top-7 md:left-7`}
            icon={
              <Icon id={backIcon ?? "arrow-right"} width={23} height={23} />
            }
            onClick={onRequestBack}
          />
        )}
        <NotifiSubscriptionCard />
      </div>
    </ModalBase>
  );
};
