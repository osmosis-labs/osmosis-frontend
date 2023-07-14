import classNames from "classnames";
import React, { FunctionComponent, MouseEvent, ReactElement } from "react";
// react-modal hasn't yet added support for React 18, causing a type error
const { default: ReactModal, setAppElement }: any = require("react-modal");

import { useWindowSize } from "~/hooks";

import { Icon } from "../components/assets";
import IconButton from "../components/buttons/icon-button";

setAppElement("body");

export interface ModalBaseProps {
  isOpen: boolean;
  onRequestClose: () => void;
  onRequestBack?: () => void;
  title?: string | ReactElement;
  className?: string;
  bodyOpenClassName?: string;
  overlayClassName?: string;
  hideCloseButton?: boolean;
  children?: any;
}

export const ModalBase: FunctionComponent<ModalBaseProps> = ({
  isOpen,
  onRequestClose,
  onRequestBack,
  title,
  className,
  bodyOpenClassName,
  overlayClassName,
  hideCloseButton,
  children,
}) => {
  const { isMobile } = useWindowSize();

  return (
    <ReactModal
      isOpen={isOpen}
      onRequestClose={(e: MouseEvent) => {
        e.preventDefault();
        onRequestClose();
      }}
      bodyOpenClassName={classNames("overflow-hidden", bodyOpenClassName)}
      overlayClassName={classNames(
        "fixed flex overflow-auto items-center inset-0 justify-center bg-osmoverse-1000/90 z-[9999]",
        overlayClassName
      )}
      className={classNames(
        "absolute flex w-full max-w-modal flex-col rounded-3xl bg-osmoverse-800 p-8 outline-none md:w-[98%] md:px-4",
        className
      )}
      closeTimeoutMS={150}
    >
      <div className="flex place-content-between items-center">
        {onRequestBack && (
          <IconButton
            aria-label="Back"
            mode="unstyled"
            size="unstyled"
            className="top-9.5 absolute left-8 z-50 w-fit cursor-pointer py-0 text-osmoverse-400 md:top-7 md:left-7"
            icon={<Icon id="chevron-left" width={18} height={18} />}
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
        {!hideCloseButton && (
          <IconButton
            aria-label="Close"
            mode="unstyled"
            size="unstyled"
            className="absolute top-8 right-8 z-50 w-fit cursor-pointer !py-0 text-osmoverse-400 hover:text-white-full md:top-7 md:right-7 xs:right-4"
            icon={<Icon id="close" width={32} height={32} />}
            onClick={onRequestClose}
          />
        )}
      </div>
      {children}
    </ReactModal>
  );
};
