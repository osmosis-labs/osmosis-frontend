import Image from "next/image";
import React, { FunctionComponent, ReactElement } from "react";
import ReactModal, { setAppElement } from "react-modal";
import classNames from "classnames";
import { useWindowSize } from "../hooks";

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
      onRequestClose={(e) => {
        e.preventDefault();
        onRequestClose();
      }}
      bodyOpenClassName={classNames("overflow-hidden", bodyOpenClassName)}
      overlayClassName={classNames(
        "fixed flex items-center inset-0 justify-center bg-modal z-50",
        overlayClassName
      )}
      className={classNames(
        "absolute outline-none md:w-[90%] w-full md:p-4 p-8 bg-surface rounded-2xl z-50 flex flex-col max-w-modal",
        className
      )}
    >
      <div className="flex items-center place-content-between">
        {onRequestBack && (
          <button
            aria-label="back"
            className="absolute md:top-6 md:left-6 top-8 left-8 cursor-pointer z-50"
            onClick={onRequestBack}
          >
            <Image
              alt="back button"
              src="/icons/chevron-left.svg"
              height={isMobile ? 24 : 32}
              width={isMobile ? 24 : 32}
            />
          </button>
        )}
        {typeof title === "string" ? (
          <div className="relative mx-auto">
            {isMobile ? <h6>{title}</h6> : <h5>{title}</h5>}
          </div>
        ) : (
          <>{title}</>
        )}
        {!hideCloseButton && (
          <button
            aria-label="close"
            className="absolute md:top-6 md:right-6 top-8 right-8 cursor-pointer z-50"
            onClick={onRequestClose}
          >
            <Image
              src={"/icons/close-dark.svg"}
              alt="close icon"
              width={isMobile ? 24 : 32}
              height={isMobile ? 24 : 32}
            />
          </button>
        )}
      </div>
      {children}
    </ReactModal>
  );
};
