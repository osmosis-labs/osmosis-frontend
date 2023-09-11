import Image from "next/image";
import { FunctionComponent } from "react";

import { Button } from "~/components/buttons";
import { ModalBase, ModalBaseProps } from "~/modals";

export const ActivateUnverifiedTokenConfirmation: FunctionComponent<
  {
    coinDenom?: string;
    coinImageUrl?: string;
    onConfirm: () => void;
  } & Pick<ModalBaseProps, "isOpen" | "onRequestClose">
> = ({ coinDenom, coinImageUrl, onConfirm, ...modalBaseProps }) => {
  if (!coinDenom || !coinImageUrl) {
    return null;
  }

  return (
    <ModalBase
      title="Activate unverified assets"
      className="!max-w-[480px]"
      {...modalBaseProps}
    >
      <div className="mx-auto flex max-w-sm flex-col items-center pt-8">
        <div className="flex flex-col items-center gap-5">
          {coinImageUrl && (
            <div className="mr-4 h-16 w-16 rounded-full">
              <Image
                src={coinImageUrl}
                alt="token icon"
                width={64}
                height={64}
              />
            </div>
          )}

          <div>
            <p className="body2 rounded-2xl text-osmoverse-100">
              <span className="font-semibold">{coinDenom}</span> is an
              unverified token. Do you wish to activate it? Be sure to research
              thoroughly before trading.
            </p>

            <p className="body2 border-gradient-neutral mt-5 rounded-[10px] border border-wosmongton-400 px-3 py-2 text-wosmongton-100">
              You can always deactivate this setting in the settings modal.
            </p>
          </div>
        </div>

        <div className="max-w-md">
          <Button
            mode="primary"
            className="mt-8 gap-3 whitespace-nowrap !px-6"
            onClick={() => {
              onConfirm();
              modalBaseProps.onRequestClose?.();
            }}
          >
            Activate
          </Button>
        </div>
      </div>
    </ModalBase>
  );
};
