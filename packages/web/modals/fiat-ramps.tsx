import { FunctionComponent, useEffect } from "react";
import { ModalBase, ModalBaseProps } from "./base";
import { FiatRampKey } from "../integrations";
import { useTransakModal } from "../integrations/transak";
import { Kado } from "../integrations/kado";

export const FiatRampsModal: FunctionComponent<
  { fiatRampKey: FiatRampKey; assetKey: string } & ModalBaseProps
> = (props) => {
  const { fiatRampKey, isOpen } = props;

  const { setModal } = useTransakModal({
    onRequestClose: props.onRequestClose,
  });

  useEffect(() => {
    if (fiatRampKey === "transak") {
      if (isOpen) {
        setModal(true);
      } else {
        setModal(false);
      }
    }
  }, [fiatRampKey, isOpen]);

  return (
    <ModalBase
      {...props}
      overlayClassName={fiatRampKey === "transak" ? "!hidden" : undefined}
      className="w-fit p-0 m-0"
      hideCloseButton
    >
      {(() => {
        switch (fiatRampKey) {
          case "kado":
            return <Kado {...props} />;
          default:
            return null;
        }
      })()}
    </ModalBase>
  );
};
