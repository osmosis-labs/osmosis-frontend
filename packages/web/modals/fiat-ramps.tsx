import { FunctionComponent, useEffect } from "react";

import { Icon } from "~/components/assets";
import { IconButton } from "~/components/ui/button";
import { FiatRampKey } from "~/integrations";
import { Kado } from "~/integrations/kado";
import { Layerswap } from "~/integrations/layerswap";
import { OnrampMoney } from "~/integrations/onrampmoney";
import { useTransakModal } from "~/integrations/transak";
import { ModalBase, ModalBaseProps } from "~/modals";

const FIAT_RAMPS_PRETTY_NAMES: Record<FiatRampKey, string> = {
  kado: "Kado",
  layerswapcoinbase: "Coinbase Layer Swap",
  moonpay: "MoonPay",
  onrampmoney: "Onramp.money",
  transak: "Transak",
};

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
      className="m-0 w-fit p-0 !bg-osmoverse-900"
      hideCloseButton
      hideDefaultBackButton
    >
      <div className="flex items-center justify-between px-6 py-4 bg-osmoverse-900 text-white-full">
        <IconButton
          icon={<Icon id="arrow-left-thin" />}
          aria-label="Back"
          className="size-12 text-wosmongton-200 hover:text-osmoverse-100 md:size-8"
          onClick={props.onRequestBack}
        />
        <h6 className="">{FIAT_RAMPS_PRETTY_NAMES[fiatRampKey]}</h6>
        <IconButton
          aria-label="Close"
          data-testid="close"
          className="size-12 text-wosmongton-200 hover:text-osmoverse-100 md:size-8"
          icon={<Icon id="close" />}
          onClick={props.onRequestClose}
        />
      </div>
      {(() => {
        switch (fiatRampKey) {
          case "kado":
            return <Kado {...props} />;
          case "moonpay":
            return null;
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
