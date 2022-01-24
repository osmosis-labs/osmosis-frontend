import React, {
  FunctionComponent,
  ReactElement,
  VoidFunctionComponent,
} from "react";
import ReactModal from "react-modal";
import classNames from "classnames";
import Image from "next/image";

export interface ModalBaseProps {
  isOpen: boolean;
  onRequestClose: () => void;

  title?: ReactElement;
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
        "fixed flex items-center justify-center inset-0 bg-modalOverlay z-1",
        overlayClassName
      )}
      className={classNames(
        "absolute outline-none w-full px-4 py-5 bg-surface rounded-2xl z-10 flex flex-col",
        className
      )}
    >
      <div
        className="absolute top-5 right-5 cursor-pointer"
        onClick={() => onRequestClose()}
      >
        <Image src="/icons/close.svg" alt="close icon" width={32} height={32} />
      </div>
      {title}
      {children}
    </ReactModal>
  );
};
