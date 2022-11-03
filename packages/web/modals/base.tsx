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
        "absolute outline-none md:w-[98%] w-full p-8 md:px-4 bg-osmoverse-800 rounded-2xl flex flex-col max-w-modal",
        className
      )}
    >
      <div className="flex items-center place-content-between">
        {onRequestBack && (
          <button
            aria-label="back"
            className="absolute md:top-7 md:left-7 top-8 left-8 cursor-pointer z-50"
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
            className="absolute md:top-7 md:right-7 top-8 right-8 cursor-pointer z-50"
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
