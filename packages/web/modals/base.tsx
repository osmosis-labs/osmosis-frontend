import React, { FunctionComponent } from "react";
import ReactModal from "react-modal";
import classNames from "classnames";

export interface ModalBaseProps {
  isOpen: boolean;
  onRequestClose: () => void;

  className?: string;
  bodyOpenClassName?: string;
  overlayClassName?: string;
}

export const ModalBase: FunctionComponent<ModalBaseProps> = ({
  isOpen,
  onRequestClose,
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
        "fixed flex items-center justify-center inset-0 bg-modalOverlay z-1",
        overlayClassName
      )}
      className={classNames(
        "absolute outline-none w-full px-4 py-5 bg-surface rounded-2xl z-10",
        className
      )}
    >
      {children}
    </ReactModal>
  );
};
