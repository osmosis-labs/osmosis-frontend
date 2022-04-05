import Image from "next/image";
import React, { FunctionComponent, ReactElement } from "react";
import ReactModal, { setAppElement } from "react-modal";
import classNames from "classnames";

setAppElement("body");

export interface ModalBaseProps {
  isOpen: boolean;
  onRequestClose: () => void;
  title?: string | ReactElement;
  className?: string;
  bodyOpenClassName?: string;
  overlayClassName?: string;
}

export const ModalBase: FunctionComponent<ModalBaseProps> = ({
  isOpen,
  onRequestClose,
  title,
  className,
  bodyOpenClassName,
  overlayClassName,
  children,
}) => {
  return (
    <ReactModal
      isOpen={isOpen}
      onRequestClose={(e) => {
        e.preventDefault();
        onRequestClose();
      }}
      bodyOpenClassName={classNames("overflow-hidden", bodyOpenClassName)}
      overlayClassName={classNames(
        "fixed flex items-center justify-center inset-0 bg-modalOverlay z-50",
        overlayClassName
      )}
      className={classNames(
        "absolute outline-none w-full p-8 bg-surface rounded-2xl z-50 flex flex-col max-w-modal",
        className
      )}
    >
      <div
        className="absolute top-5 right-5 cursor-pointer"
        onClick={onRequestClose}
      >
        <Image src="/icons/close.svg" alt="close icon" width={32} height={32} />
      </div>
      {typeof title === "string" ? <h5>{title}</h5> : <>{title}</>}
      {children}
    </ReactModal>
  );
};
