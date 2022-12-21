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
        "fixed flex items-center inset-0 justify-center bg-osmoverse-1000/90 z-[9999]",
        overlayClassName
      )}
      className={classNames(
        "absolute flex w-full max-w-modal flex-col rounded-2xl bg-osmoverse-800 p-8 outline-none md:w-[98%] md:px-4",
        className
      )}
    >
      <div className="flex place-content-between items-center">
        {onRequestBack && (
          <button
            aria-label="back"
            className="absolute top-8 left-8 z-50 cursor-pointer md:top-7 md:left-7"
            onClick={onRequestBack}
          >
            <Image
              alt="back button"
              src="/icons/left.svg"
              height={32}
              width={32}
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
            className="absolute top-8 right-8 z-50 cursor-pointer md:top-7 md:right-7"
            onClick={onRequestClose}
          >
            <Image
              src={"/icons/close-dark.svg"}
              alt="close icon"
              width={32}
              height={32}
            />
          </button>
        )}
      </div>
      {children}
    </ReactModal>
  );
};
