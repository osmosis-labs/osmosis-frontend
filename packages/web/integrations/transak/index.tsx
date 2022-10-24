import { FunctionComponent } from "react";
import { useTransakModal } from "./use-transak-modal";

/** Wrapper component for transak-opened modal.  */
export const Transak: FunctionComponent<{
  showTransakModalOnMount?: boolean;
  onRequestClose?: () => void;
}> = ({ showTransakModalOnMount, onRequestClose }) => {
  useTransakModal({ onRequestClose, showOnMount: showTransakModalOnMount });

  return <div></div>;
};
