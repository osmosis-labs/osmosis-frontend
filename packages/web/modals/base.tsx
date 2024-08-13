import classNames from "classnames";
import React, { PropsWithChildren, ReactNode } from "react";
import ReactModal, { setAppElement } from "react-modal";
import { useUnmount } from "react-use";

import { Icon } from "~/components/assets";
import { IconButton } from "~/components/ui/button";
import { SpriteIconId } from "~/config";
import { useFeatureFlags } from "~/hooks";
import { useWindowSize } from "~/hooks/window/use-window-size";

if (setAppElement) {
  setAppElement("body");
}

export interface ModalBaseProps {
  isOpen: boolean;
  onRequestClose: () => void;
  onRequestBack?: () => void;
  onAfterClose?: () => void;
  backIcon?: SpriteIconId;
  title?: string | ReactNode;
  className?: string;
  bodyOpenClassName?: string;
  overlayClassName?: string;
  hideCloseButton?: boolean;
}

export const ModalBase = ({
  isOpen,
  onRequestClose,
  onRequestBack,
  onAfterClose,
  backIcon,
  title,
  className,
  bodyOpenClassName,
  overlayClassName,
  hideCloseButton,
  children,
}: PropsWithChildren<ModalBaseProps>) => {
  const { isMobile } = useWindowSize();
  const featureFlags = useFeatureFlags();
  const bodyOpenClassNames = classNames("overflow-hidden", bodyOpenClassName);
  useUnmount(() => {
    document.body.classList.remove(bodyOpenClassNames);
  });

  return (
    <ReactModal
      isOpen={isOpen}
      onRequestClose={(e) => {
        e.preventDefault();
        onRequestClose();
      }}
      bodyOpenClassName={classNames("overflow-hidden", bodyOpenClassName)}
      overlayClassName={classNames(
        "fixed flex overflow-auto items-center inset-0 justify-center bg-osmoverse-1000/90 z-[9999]",
        overlayClassName
      )}
      className={classNames(
        "absolute mx-10 my-8 flex max-h-[95vh] w-full max-w-modal flex-col overflow-auto rounded-3xl p-8 outline-none sm:max-h-full sm:w-full sm:px-4",
        className,
        {
          "bg-osmoverse-800": !featureFlags.limitOrders,
          "bg-osmoverse-850": featureFlags.limitOrders,
        }
      )}
      closeTimeoutMS={150}
      onAfterClose={onAfterClose}
    >
      <div className="flex place-content-between items-center">
        {onRequestBack && (
          <IconButton
            aria-label="Back"
            className="top-9.5 absolute left-8 z-50 w-fit cursor-pointer py-0 text-osmoverse-400 md:left-7 md:top-7"
            icon={
              <Icon id={backIcon ?? "chevron-left"} width={18} height={18} />
            }
            onClick={onRequestBack}
          />
        )}
        {typeof title === "string" ? (
          <div className="relative mx-auto">
            {isMobile ? <h6>{title}</h6> : <h5>{title}</h5>}
          </div>
        ) : (
          <>{title}</>
        )}
        {!hideCloseButton && <ModalCloseButton onClick={onRequestClose} />}
      </div>
      {children}
    </ReactModal>
  );
};

export const ModalCloseButton = ({
  onClick,
  className,
}: {
  onClick: () => void;
  className?: string;
}) => (
  <IconButton
    aria-label="Close"
    className={classNames(
      "absolute right-8 top-[24px] z-50 !h-12 !w-12 cursor-pointer !py-0 text-wosmongton-200 hover:text-osmoverse-100 md:right-7 md:top-7 md:!h-8 md:!w-8 xs:right-4",
      className
    )}
    icon={<Icon id="close" className="md:h-4 md:w-4" />}
    onClick={onClick}
  />
);
