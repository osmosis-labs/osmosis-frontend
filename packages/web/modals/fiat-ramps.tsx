import { FunctionComponent, useEffect } from "react";

import { FiatRampKey } from "~/integrations";
import { Kado } from "~/integrations/kado";
import { Layerswap } from "~/integrations/layerswap";
import { OnrampMoney } from "~/integrations/onrampmoney";
import { useTransakModal } from "~/integrations/transak";
import { ModalBase, ModalBaseProps } from "~/modals";

export const FiatRampsModal: FunctionComponent<
  {
    fiatRampKey: FiatRampKey;
    assetKey: string;
    transakModalProps?: Parameters<typeof useTransakModal>[0];
  } & ModalBaseProps
> = (props) => {
  const { fiatRampKey, isOpen } = props;

  const { setModal } = useTransakModal({
    onRequestClose: props.onRequestClose,
    ...props.transakModalProps,
  });

  useEffect(() => {
    if (fiatRampKey === "transak") {
      if (isOpen) {
        setModal(true);
      } else {
        setModal(false);
      }
    }
  }, [fiatRampKey, isOpen, setModal]);

  return (
    <ModalBase
      {...props}
      overlayClassName={fiatRampKey === "transak" ? "!hidden" : undefined}
      className="m-0 w-fit p-0"
      hideCloseButton
    >
      {(() => {
        switch (fiatRampKey) {
          case "kado":
            return <Kado {...props} />;
          case "onrampmoney":
            return <OnrampMoney {...props} />;
          case "layerswapcoinbase":
            return <Layerswap {...props} />;
          default:
            return null;
        }
      })()}
    </ModalBase>
  );
};
