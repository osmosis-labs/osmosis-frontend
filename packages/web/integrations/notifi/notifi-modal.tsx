import { useNotifiClientContext } from "@notifi-network/notifi-react-card";
import { FunctionComponent } from "react";

import { Icon } from "~/components/assets";
import IconButton from "~/components/buttons/icon-button";
import { useWindowSize } from "~/hooks";
import { useNotifiModalContext } from "~/integrations/notifi/notifi-modal-context";
import { NotifiSubscriptionCard } from "~/integrations/notifi/notifi-subscription-card";
import { ModalBase, ModalBaseProps } from "~/modals";
import { useStore } from "~/stores";

interface Props extends ModalBaseProps {
  onOpenNotifi: () => void;
}

export const NotifiModal: FunctionComponent<Props> = (props) => {
  const { innerState } = useNotifiModalContext();
  const finalProps = { ...props, ...innerState };

  const {
    innerState: { onRequestBack, backIcon } = {},
    setIsOverLayEnabled,
    isPreventingCardClosed,
    isInCardOverlayEnabled,
    setIsInCardOverlayEnabled,
  } = useNotifiModalContext();

  const {
    chainStore: {
      osmosis: { chainId },
    },
    accountStore,
  } = useStore();

  const { client } = useNotifiClientContext();

  const { isMobile } = useWindowSize();

  if (!accountStore.getWallet(chainId) || !client?.isInitialized || !isMobile) {
    return null;
  }

  return (
    <ModalBase
      isOpen={finalProps.isOpen || isPreventingCardClosed}
      onRequestClose={() => {
        finalProps.onRequestClose();
        setIsOverLayEnabled(false);
      }}
      title={finalProps.title}
      className="sm:px-2"
    >
      <div className="mt-4 flex max-h-96 flex-col overflow-y-auto">
        {isInCardOverlayEnabled ? (
          <div
            className="fixed bottom-0 left-0 right-0 top-0 z-[1] bg-osmoverse-1000 opacity-90"
            onClick={() => {
              setIsInCardOverlayEnabled(false);
              finalProps.onOpenNotifi(); // modal remains open while inCardOverlay is clicked
            }}
          />
        ) : null}
        {onRequestBack && (
          <IconButton
            aria-label="Back"
            mode="unstyled"
            size="unstyled"
            className={`top-9.5 absolute ${
              backIcon !== "setting" ? "left" : "right"
            }-8 z-50 mt-1 w-fit rotate-180 cursor-pointer py-0 text-osmoverse-400 md:left-7 md:top-7`}
            icon={
              <Icon id={backIcon ?? "arrow-right"} width={23} height={23} />
            }
            onClick={onRequestBack}
          />
        )}
        <NotifiSubscriptionCard
          isPopoverOrModalBaseOpen={finalProps.isOpen ? true : false}
          closeCard={finalProps.onRequestClose}
        />
      </div>
    </ModalBase>
  );
};
